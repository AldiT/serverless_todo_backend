import axios from 'axios';
import Axios from 'axios';


async function get(){
    try{
        const result = await axios.get("https://dev-ak43slxn.us.auth0.com/.well-known/jwks.json");

        console.log(result.data.keys[0].x5c[0]);
    }catch(e){
        console.log(e);
    }
}

setTimeout(get, 1);