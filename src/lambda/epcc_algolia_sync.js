const algoliasearch = require("algoliasearch");
const { MoltinClient } = require("@moltin/request");

const epcc_client = new MoltinClient({
  client_id: process.env.PW_CLIENT_ID,
  client_secret: process.env.PW_CLIENT_SECRET
});

exports.handler = async function(event, context, callback) {
  try {
   // checks for a secret key
   if (event.headers["x-moltin-secret-key"] === "") {
    return {
      statusCode: 400,
      body: "Missing X-MOLTIN-SECRET-KEY header"
    }
   }
   // reads configuration parameters from secret key
   const { config: {dbname, apikey,indexName, ignore_draft } } = JSON.parse(event.headers["x-moltin-secret-key"])

   // reads event parameters and data
   const { triggered_by, payload } = JSON.parse(event.body)
   const [object, action] = triggered_by.split(".");
   
   // ensure that it is a product event.
   if (object !== "product") {
     return {
       statusCode: 400,
       body: "Not a product event. No updates occured."
     }
    }
      
    //connects to Algolia
    const client = algoliasearch(dbname, apikey);
    const index = client.initIndex(indexName);
  
    let body;
      
    //handles product.deleted
    if (action === "deleted") {
       //checks to see if object exists in Algolia
       let obj_exists = await index.getObject(payload.id).then(async(e)=>{
            return true
       }).catch(async(error)=>{
            return false
       })
        
      if(obj_exists)
         body = await index.deleteObject(payload.id);
      else
         body = "Object not found - could not be deleted"
        
      return { statusCode: 200, body:JSON.stringify(body) };
        
    }
    
    //reads relationship data: brands,categories,main_image,collections
    const {
      data: { id: productID }
    } = payload;
      
    const product = await epcc_client.get(`products/${productID}?include=brands,categories,main_image,collections`);
 
    const {
      data: {
        id: objectID,
        name,
        slug,
        sku,
        status,
        meta: {
          display_price: {
            without_tax: { amount, formatted: price }
          }
        }
      },
      included:default_inc ={main_images:[{link:{ href:""}} ]},
      included: {
        main_images: [
          {
            link: { href:imgUrl="" }
          } 
        ],
        categories = [],
        brands = [],
        collections = []
      }=default_inc
    } = product;
      
    //converts object arrays to string arrays 
    let collectionsArray = collections.map(collection => collection.name);
    let categoriesArray = categories.map(category => category.name);
    let brandsArray = brands.map(brand => brand.name);
   
    //constructs Algolia entry
    const entry = {
      objectID,
      name,
      slug,
      sku,
      amount,
      price,
      imgUrl,
      status,
      collections: collectionsArray,
      categories: categoriesArray,
      brands: brandsArray
    };
    //console.log(entry);
    
    //handles product.updated and product.updated
    if (action === "updated" ||action === "created") {
       //checks to see if object exists in Algolia
       let obj_in_algo = await index.getObject(objectID).then(async(e)=>{
            return e
       }).catch(async(error)=>{
            return false
       })
       
       // executes rules based on "ignore_draft" setting
       // skip if ignore_draft is true AND product status in EPCC is draft AND product in Algolia is draft or doesn't exist

       if(payload.data.status === "draft" && (!obj_in_algo || obj_in_algo.status === "draft") && ignore_draft)
           return { statusCode: 200, body: "ignore_draft is set - changes to draft products is ignored" };
       
       // updates or create entry       
       body = await index.saveObject(entry);
       return { statusCode: 200, body:JSON.stringify(body) };
    } else {
      throw new Error(`'${action}' is not a valid trigger`);
    }
  } catch (errors) {
    return { statusCode: 500, body: errors.message };
  }
   
};




