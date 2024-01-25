import pandas as pd
import requests
from bs4 import BeautifulSoup as bs
base_url = "https://www.consumeraffairs.com/food/dominos.html"
all_pages_reviews =[]

def scraper():

    for i in range(1,6):
         # fetching reviews from five pages
        pagewise_reviews = [] 
        query_parameter = "?page="+str(i)
        url = base_url + query_parameter
        response = requests.get(url)
        soup = bs(response.content, 'html.parser')
        rev_div = soup.findAll("div",attrs={"class":"rvw__bd"}) 
    
    for j in range(len(rev_div)):
         # finding each review text
        pagewise_reviews.append(rev_div[j].find("p").text)
        
    for k in range(len(pagewise_reviews)):
        # making list of reviews
        all_pages_reviews.append(pagewise_reviews[k]) 
        return all_pages_reviews

# coverting dataframes to text file
reviews = scraper()
if reviews:
    length = len(reviews)+1
    i = range(1, length)
    reviews_df = pd.DataFrame({'review':reviews}, index=i)
    reviews_df.to_csv('reviews.txt', sep='t')
