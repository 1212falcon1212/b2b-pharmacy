Sentos API
 1.4.2 
OAS3
https://api.sentos.com.tr/
Sentos API Docs
API metodlarına erişmek için URL olarak https://firma-adi.sentos.com.tr/api adresi kullanılmalıdır. İstekleri gönderirken header içerisinde Content-Type:"application/json" olmalıdır.

API vasıtasıyla;

Kategori işlemleri
Sipariş işlemleri
Ürün işlemleri
Depo işlemleri
ERP işlemleri
Platform işlemleri
Perakende işlemleri yapabilirsiniz.
Authenticating
Sentos API kimlik doğrulama için Basic Auth kullanmaktadır. Bu protokolü destekleyen istemci kütüphanelerini kullanarak oturum açabilir ve API'yi kullanabilirsiniz. API bilgilerine Sentos paneli üzerinden Hesabım sayfasından ulaşılabilir. Postman Collection'ı : İndir

Rate Limit
Aynı body ile GET 2/dk
POST 12/dk
Sentos - Website

Kategoriler
Kategori İşlemleri



GET
/categories
Kategorileri çek

Response : 

[
  {
    "id": 1,
    "name": "telefon",
    "parent_id": 4,
    "sub_categories": []
  },
  {
    "id": 2,
    "name": "laptop",
    "parent_id": 4,
    "sub_categories": [
      {
        "id": 286,
        "parent_id": 285,
        "name": "Example Category 2",
        "sub_categories": [
          {
            "id": 287,
            "parent_id": 286,
            "name": "Example Category 3",
            "sub_categories": []
          }
        ]
      }
    ]
  }
]

GET
/products
Tüm Ürünleri Listele

Tüm parametreler | optional

Name	Description
size
integer
(query)
size
page
integer
(query)
page
sku
string
(query)
sku
orderby_id
string
(query)
orderby_id



Response : 

{
  "id": 72,
  "category_id": 1,
  "sku": "testsku99",
  "name": "Necix's Erkek Bebek Beyaz Kuzulu Inek Tulum Takım 3 Lü",
  "invoice_name": "Necix's Erkek Bebek Beyaz Kuzulu Inek Tulum Takım 3 Lü",
  "brand": "Loinos",
  "description": "%100 Pamuklu",
  "purchase_price": "75,00",
  "sale_price": "89,90",
  "currency": "TL",
  "vat_rate": 8,
  "volumetric_weight": "0,00",
  "barcode": "1122334455",
  "stocks": [
    {
      "warehouse": 1,
      "stock": 10
    }
  ],
  "prices": {
    "b2c": {
      "list_price": "15.9",
      "sale_price": "15.8"
    },
    "n11": {
      "list_price": "23",
      "sale_price": "12"
    },
    "trendyol": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "hepsiburada": {
      "list_price": null,
      "sale_price": "18"
    },
    "ciceksepeti": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "epttavm": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "pazarama": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "modanisa": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "pasaj": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "amazon": {
      "list_price": null,
      "sale_price": "11.35"
    },
    "beymen": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "lcw": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "joom": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "etsy": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "hepsiglobal": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "exporgin": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "woo": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "idea": {
      "list_price": "0",
      "sale_price": "0"
    },
    "hipotenus": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "opencart": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "ethica": {
      "list_price": "11.35",
      "sale_price": "10.95"
    },
    "ikas": {
      "list_price": "11.35",
      "sale_price": "10.95"
    }
  },
  "images": [
    {
      "id": 366,
      "url": "https://test-bs.sentos.com.tr/urunres/images1.jpg"
    }
  ],
  "variants": [
    {
      "sku": "testsku99-M49-R7",
      "barcode": "112233",
      "model": {
        "name": "Beden",
        "value": "0-3 AY"
      },
      "color": "sarı",
      "stocks": [
        {
          "warehouse": 1,
          "stock": 18
        }
      ],
      "images": []
    }
  ],
  "attributes": [
    {
      "name": "cinsiyet",
      "value": "çocuk"
    }
  ],
  "description_detail": "Necix's Erkek Bebek Beyaz Kuzulu Inek Tulum Takım 3 Lü Necix's Kuzulu İnekli 3'lü Bebek Tulumu %100 Pamuklu Bebeğiniz için tamamen pamuklu olarak veya doğal malzemeler kullanılarak üretilmiştir."
}