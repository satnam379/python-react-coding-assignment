import * as React from "react";

const SSRPage = ({serverData}) =>(
    <main>
        <h1> SSR Page </h1>
        <img alt="React App" src={serverData.url} />
    </main>
)

export default SSRPage;

export async function getServerData(){
    try{
        const response = await fetch('https://api.slingacademy.com/v1/sample-data/photos/1')
        if (!response.ok){
            throw new Error('Response gets failed')
        }
        return{
            props: await response.json
        }
    } catch(error){
         return{
            status:500,
            header:{},
            props :{}
         }

    }
}