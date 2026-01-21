Authentication
Security scheme type:	OAuth2
OAuth2 Flow	accessCode
Authorization URL	https://api.parasut.com/oauth/authorize
Token URL	https://api.parasut.com/oauth/token
Paraşüt API kimlik doğrulama için oAuth2 kullanmaktadır. Bu protokolü destekleyen istemci kütüphanelerini kullanarak oturum açabilir ve API'yi kullanabilirsiniz.

Gerekli CLIENT_ID, CLIENT_SECRET ve REDIRECT_URL bilgilerini almak için destek@parasut.com adresine mail atabilirsiniz.

Kimlik doğrulama işleminin başarılı olması durumunda bir adet kimlik jetonu (authentication token) ve bir adet de yenileme jetonu (refresh token) gönderilecektir. Kimlik jetonu 2 saat süreyle geçerlidir ve her istekte http başlık bilgilerinin içerisinde gönderilmelidir. Bu sürenin sonunda kimlik jetonu geçerliliğini yitirecektir ve yenileme jetonu kullanılarak tekrar üretilmesi gerekmektedir.

access_token almak:
access_token almanız için iki farklı seçenek bulunmaktadır.

Kullanım şeklinize bağlı olarak iki yöntemden birini tercih etmelisiniz.

1. grant_type=authorization_code
Bu yöntemi kullanabilmek için öncelikle aşağıda belirtildiği gibi kullanıcıyı başarılı authentication işleminin ardından yönlendirmek istediğiniz REDIRECT_URL'i bize ulaşarak kayıt ettirmeniz gerekmektedir. REDIRECT_URL varsayılan olarak urn:ietf:wg:oauth:2.0:oob gelmektedir.

Size özel bir REDIRECT_URL tanımlamak isterseniz destek@parasut.com adresine mail atabilirsiniz.

Kullanıcıyı şu adrese yönlendirin:
BASE_URL/oauth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URL&response_type=code
Oturum açmışsa ve uygulamayı kabul ederse, kullanıcı sizin tanımladığınız REDIRECT_URL'e şu şekilde gelmesi gerekiyor: REDIRECT_URL?code=xxxxxxx

Burada size gelen "code" parametresi ile access token almalısınız.

curl -F grant_type=authorization_code \
-F client_id=CLIENT_ID \
-F client_secret=CLIENT_SECRET \
-F code=RETURNED_CODE \
-F redirect_uri=REDIRECT_URL \
-X POST BASE_URL/oauth/token
2. grant_type=password
E-posta ve şifre ile access_token almanız için aşağıdaki istekte size özel alanları doldurarak POST isteği atmanız gerekmektedir.

curl -F grant_type=password \
-F client_id=CLIENT_ID \
-F client_secret=CLIENT_SECRET \
-F username=YOUREMAIL \
-F password=YOURPASSWORD \
-F redirect_uri=urn:ietf:wg:oauth:2.0:oob \
-X POST BASE_URL/oauth/token
Sonuç
Her iki yöntem sonucunda size aşağıdaki gibi bir sonuç dönecektir:

{
 "access_token": "XYZXYZXYZ",
 "token_type": "bearer",
 "expires_in": 7200,
 "refresh_token": "ABCABCABC"
}
Burada dönen access_token'ı API endpointlerine ulaşmak için gönderdiğiniz sorgulara Authorization header'ı olarak Bearer XYZXYZXYZ şeklinde eklemeniz gerekiyor.

Refresh token ile yeni access_token alma örneği:
access_token geçerliliğini 2 saat içerisinde yitirdiği için refresh_token ile yeni token alabilirsiniz.

curl -F grant_type=refresh_token \
-F client_id=CLIENT_ID \
-F client_secret=CLIENT_SECRET \
-F refresh_token=REFRESH_TOKEN \
-X POST BASE_URL/oauth/token
refresh_token ile yeni bir access_token alırken aynı zamanda yeni bir refresh_token da almaktasınız. Dolayısıyla, daha sonra yeniden bir access_token alma isteğinizde size dönen yeni refresh_tokenı kullanmalısınız.

ndex
Parameters
path Parameters ?
 company_id	
integer Required
Firma ID

query Parameters ?
 filter[name]	
string
 filter[code]	
string
 sort	
string
"-id"
Sortable parameters - Available: id, name

 page[number]	
integer
1
Page Number

 page[size]	
integer [ 1 .. 25 ]
15
Page Size

 include	
string
Response ile birlikte geri dönmesini istediğiniz ilişkiler - Available: inventory_levels, category


get /{company_id}/products

Response : 

{
  "data": [
    {
      "id": "string",
      "type": "products",
      "attributes": {
        "sales_excise_duty_code": "string",
        "sales_invoice_details_count": 0,
        "purchase_invoice_details_count": 0,
        "list_price_in_trl": 0,
        "buying_price_in_trl": 0,
        "stock_count": 0,
        "created_at": "2025-12-31",
        "updated_at": "2025-12-31",
        "code": "string",
        "name": "string",
        "vat_rate": 0,
        "sales_excise_duty": 0,
        "sales_excise_duty_type": "string",
        "purchase_excise_duty": 0,
        "purchase_excise_duty_type": "string",
        "unit": "string",
        "communications_tax_rate": 0,
        "archived": true,
        "list_price": 0,
        "currency": "string",
        "buying_price": 0,
        "buying_currency": "string",
        "inventory_tracking": true,
        "initial_stock_count": 0,
        "gtip": "string",
        "barcode": "string"
      },
      "relationships": {
        "inventory_levels": {
          "data": {
            "id": "string",
            "type": "inventory_levels"
          }
        },
        "category": {
          "data": {
            "id": "string",
            "type": "item_categories"
          }
        }
      }
    }
  ],
  "included": [
    {
      "id": "string",
      "type": "inventory_levels",
      "attributes": {},
      "relationships": {}
    }
  ],
  "meta": {
    "current_page": 0,
    "total_pages": 0,
    "total_count": 0
  }
}