API Hakkında
EntegraAPI'yi kullanmak veya görüşlerinizi bizimle paylaşmak isterseniz bizimle apidestek@entegrabilisim.com adresi üzerinden iletişime geçebilirsiniz.
API'yi kullanarak Entegra verilerine ulaşabilir ve kendi uygulamalarınız ile entegre edebilirsiniz.

Genel Bilgiler

Entegranın REST API'sine yapılan tüm isteklerin kimliğinin doğrulanması gerekmektedir.

API endpointlerine ulaşmak için ilk olarak size verilen 'email' ve 'password' bilgileriyle sisteme login olup acces token almalısınız.

Bu alınan access token'ı sorgulara Authorization header'ı olarak JWT accees şeklinde eklenmelidir.

Request limiti saat/7200 olarak ayarlanmıştır. Limit aşımında 15 dk ip engeli tanımlanmıştır.

Access token süresi 1 haftadır.

Refresh token süresi 1 aydır.

Not:Her Request için token isteği yapılmamalıdır. Aksi durumda otomatik olarak engellenirsiniz.


Giris - Login - Authentication
POST
Get Token
https://apiv2.entegrabilisim.com/api/user/token/obtain/

Example Request
Get Token
curl
curl --location 'https://apiv2.entegrabilisim.com/api/user/token/obtain/' \
--header 'Content-Type: application/json' \
--data-raw ' {
     "email": "apitestv2@entegrabilisim.com",
     "password":"apitestv2"
 }'

 HEADERS
Content-Type
application/json

Body
raw
 {
     "email": "apitestv2@entegrabilisim.com",
     "password":"apitestv2"
 }

 POST
Refresh Token
https://apiv2.entegrabilisim.com/api/user/token/refresh/
HEADERS
Content-Type
application/json

Body
raw
View More
{
	"refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTY4OTMzMTc2OSwianRpIjoiMTE2NjgxNTg0ZThjNGE5MDk5OWEzMDEyMTNkMTdiMzMiLCJ1c2VyX2lkIjozNX0.tO5mMCwMp20OlVahVvP4_edHzbMruVC339WZW3wsF"
}

REQUEST : 

curl --location 'https://apiv2.entegrabilisim.com/api/user/token/refresh/' \
--header 'Content-Type: application/json' \
--data '{
	"refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTY4OTMzMTc2OSwianRpIjoiMTE2NjgxNTg0ZThjNGE5MDk5OWEzMDEyMTNkMTdiMzMiLCJ1c2VyX2lkIjozNX0.tO5mMCwMp20OlVahVvP4_edHzbMruVC339WZW3wsF"
}'

rünler - Products
Ürünler - Products API üç ana endpointden oluşmaktadır, urunlerin olusturulmasi, guncellenmesi ve listelenmesi icin kullanilir.

GET
Get Products
https://apiv2.entegrabilisim.com/product/page=1/
Entegrada mevcut olan ürünlerin listelenmesi.
“date_add” ve “date_change” alanlari ürünün entegraya ekleniş tarihlarini ve en son degiştirme
tarihlerini belirtir.
NOT: Ağıdaki parametreler gönderilmezse, varsayılan olarak geriye 100 ürün listelemesi yapıcaktır.

Table
**Parameter	Data Type	In	Description
Token	string	header	Müşteri token anahtarı
id	integer	query	id ile ürün listelemesi.
productCode	string	query	productCode ile ürün listelemesi.
Burada gönderilen değer içerinden özel karakter varsa bu değer 'hexa' dönüştürüp gönderilmelidir.
barcode	integer	query	barcode ile ürün listelemesi.
sync	integer	query	sync ile ürün listelemesi.
api_sync	integer	query	api_sync ile ürün listelemesi.
send_api	integer	query	send_api ile ürün listelemesi.
start_date(date_add)	date	query	Belirli bir zaman aralığında eklenen ürünleri listeleme.
date_change	date	query	En son degiştirme
tarihlerini belirtir.
end_date	date	query	Belirli bir zaman aralığında eklenen ürünleri listeleme.
additional_categories	string	query	Ek kategorileri listelemek için eklemiştir, true olarak gönderilebilir.
send_supplier	String	query	Pazaryeri bazlı ürünleri listeleme.
status	integer	query	Aktif-Pasif ürünleri ayırmak için kullanılır.(1-0)**

Example Request
Get Products Example
curl
curl --location 'https://apiv2.entegrabilisim.com/product/page=1/' \
--header 'Authorization: JWT ' \
--header 'Content-Type: application/json'

RESPONSE : 

{
  "totalProduct": 3279,
  "porductList": [
    {
      "id": "1223",
      "productCode": "3007975",
      "status": "1",
      "description": "Finish parlatici",
      "product_type": "0",
      "barcode": "8690570518436",
      "gtin": "",
      "send_api": "0",
      "name": "Finish Bulaşık Makinesi Parlatıcı 800 ml",
      "brand": "Finish",
      "group": "1",
      "quantity": "14",
      "currencyType": "TRL",
      "kdv_id": "18",
      "price1": "1.18",
      "price2": "38.94",
      "price3": "0.00",
      "price4": "0.00",
      "price5": "0.00",
      "price6": "0.00",
      "price7": "0.00",
      "price8": "0.00",
      "n11_price": "10.62",
      "n11_discountValue": "0.00",
      "hb_price": "1.18",
      "trendyol_listPrice": "10.00",
      "trendyol_salePrice": "9.44",
      "eptt_price": "0.00",
      "eptt_iskonto": "0.00",
      "n11pro_price": "0.00",
      "n11pro_discountValue": "0.00",
      "amazon_price": "0.00",
      "amazon_salePrice": "0.00",
      "mizu_price1": "0.00",
      "mizu_price2": "0.00",
      "zebramo_listPrice": "0.00",
      "zebramo_salePrice": "236.00",
      "farmazon_price": "0.00",
      "farmazon_market_price": "0.00",
      "farmaBorsaPrice": "0.00",
      "farmaborsa_psPrice": "0.00",
      "morhipo_listPrice": "0.00",
      "morhipo_salePrice": "0.00",
      "lidyana_listPrice": "0.00",
      "lidyana_salePrice": "0.00",
      "pazarama_listPrice": "0.00",
      "pazarama_salePrice": "0.00",
      "vfmall_listPrice": "0.00",
      "vfmall_salePrice": "0.00",
      "aliniyor_listPrice": "0.00",
      "aliniyor_salePrice": "0.00",
      "aliexpress_price": "0.00",
      "aliexpress_salePrice": "0.00",
      "modanisa_listPrice": "0.00",
      "modanisa_salePrice": "0.00",
      "bpazar_price1": "0.00",
      "bpazar_price2": "0.00",
      "flo_listPrice": "0.00",
      "flo_salePrice": "0.00",
      "novadan_price": "0.00",
      "needion_listPrice": "0.00",
      "needion_salePrice": "0.00",
      "bisifirat_listPrice": "0.00",
      "bisifirat_salePrice": "0.00",
      "iyifiyat_listPrice": "0.00",
      "iyifiyat_salePrice": "0.00",
      "turkcellpasaj_listPrice": "0.00",
      "turkcellpasaj_salePrice": "0.00",
      "narwoo_price": "0.00",
      "narwoo_salePrice": "0.00",
      "joom_price": "0.00",
      "joom_msrPrice": "0.00",
      "nevade_listPrice": "0.00",
      "nevade_salePrice": "0.00",
      "yapisepeti_listPrice": "0.00",
      "yapisepeti_salePrice": "0.00",
      "op1001_listPrice": "0.00",
      "op1001_salePrice": "0.00",
      "etsy_price": "0.00",
      "wish_price": "0.00",
      "omnitron_price1": "0.00",
      "omnitron_price2": "0.00",
      "zoodmall_price": "0.00",
      "buying_price": "0.00",
      "supplier": "Manual",
      "date_change": "12/04/2021 1:22:36 PM",
      "date_add": "12/04/2021 1:22:36 PM",
      "hb_sku": "",
      "mpn": "",
      "alan1": "",
      "alan2": "",
      "alan3": "",
      "alan4": "",
      "alan5": "",
      "variatios": [
        {
          "id": "260",
          "productCode": "3007974",
          "barcode": "",
          "gtin": "",
          "quantity": "100",
          "price": "150.00",
          "hb_st_sku": "",
          "hb_sku": "",
          "price1": "0.00",
          "price2": "0.00",
          "price3": "0.00",
          "price4": "0.00",
          "price5": "0.00",
          "price6": "0.00",
          "price7": "0.00",
          "price8": "0.00",
          "n11_price": "0.00",
          "n11_discountValue": "0.00",
          "hb_price": "0.00",
          "trendyol_listPrice": "0.00",
          "trendy_price": "0.00",
          "eptt_price": "0.00",
          "eptt_iskonto": "0.00",
          "n11pro_price": "0.00",
          "n11pro_discountValue": "0.00",
          "amazon_price": "0.00",
          "amazon_salePrice": "0.00",
          "mizu_price1": "0.00",
          "mizu_price2": "0.00",
          "zebramo_listPrice": "0.00",
          "zebramo_salePrice": "0.00",
          "farmazon_price": "0.00",
          "farmazon_market_price": "0.00",
          "farmaBorsaPrice": "0.00",
          "farmaborsa_psPrice": "0.00",
          "morhipo_listPrice": "0.00",
          "morhipo_price": "0.00",
          "lidyana_listPrice": "0.00",
          "lidyana_salePrice": "0.00",
          "pazarama_listPrice": "0.00",
          "pazarama_salePrice": "0.00",
          "vfmall_listPrice": "0.00",
          "vfmall_salePrice": "0.00",
          "aliniyor_listPrice": "0.00",
          "aliniyor_salePrice": "0.00",
          "aliexpress_price": "0.00",
          "aliexpress_salePrice": "0.00",
          "modanisa_listPrice": "0.00",
          "modanisa_price": "0.00",
          "bpazar_price1": "0.00",
          "bpazar_price2": "0.00",
          "flo_listPrice": "0.00",
          "flo_salePrice": "0.00",
          "novadan_price": "0.00",
          "needion_listPrice": "0.00",
          "needion_salePrice": "0.00",
          "bisifirat_listPrice": "0.00",
          "bisifirat_salePrice": "0.00",
          "iyifiyat_listPrice": "0.00",
          "iyifiyat_salePrice": "0.00",
          "turkcellpasaj_listPrice": "0.00",
          "turkcellpasaj_salePrice": "0.00",
          "narwoo_price": "0.00",
          "narwoo_salePrice": "0.00",
          "joom_price": "0.00",
          "joom_msrPrice": "0.00",
          "nevade_listPrice": "0.00",
          "nevade_salePrice": "0.00",
          "yapisepeti_listPrice": "0.00",
          "yapisepeti_salePrice": "0.00",
          "op1001_listPrice": "0.00",
          "op1001_salePrice": "0.00",
          "etsy_price": "0.00",
          "wish_price": "0.00",
          "omnitron_price1": "0.00",
          "omnitron_price2": "0.00",
          "zoodmall_price": "0.00",
          "buying_price": "0.00",
          "itemdim1code": "6587235958937",
          "itemdim2code": "41539370942617",
          "variationSpec": [
            {
              "name": "size",
              "value": "800"
            }
          ],
          "variation_pictures": []
        },

        Parametreler : 

        Table
Parameter	Data Type	In	Description
Token	string	header	Müşteri token anahtarı
id	integer	query	id ile ürün listelemesi.
productCode	string	query	productCode ile ürün listelemesi.
Burada gönderilen değer içerinden özel karakter varsa bu değer 'hexa' dönüştürüp gönderilmelidir.
barcode	integer	query	barcode ile ürün listelemesi.
sync	integer	query	sync ile ürün listelemesi.
api_sync	integer	query	api_sync ile ürün listelemesi.
send_api	integer	query	send_api ile ürün listelemesi.
start_date(date_add)	date	query	Belirli bir zaman aralığında eklenen ürünleri listeleme.
date_change	date	query	En son degiştirme
tarihlerini belirtir.
end_date	date	query	Belirli bir zaman aralığında eklenen ürünleri listeleme.
additional_categories	string	query	Ek kategorileri listelemek için eklemiştir, true olarak gönderilebilir.
send_supplier	String	query	Pazaryeri bazlı ürünleri listeleme.
status	integer	query	Aktif-Pasif ürünleri ayırmak için kullanılır.(1-0)

_Örnek sorgular
https://apiv2.entegrabilisim.com/product/page=1/?id=1242
-productCode ile sorgulamak için,
https://apiv2.entegrabilisim.com/product/page=1/?productCode=D22KB-1420
-barcode ile sorgulamak için,
https://apiv2.entegrabilisim.com/product/page=1/?barcode=M2726DKH
- sync ile sorgulamak için,
https://apiv2.entegrabilisim.com/product/page=1/?sync=0
- api_sync ile sorgulamak için,
https://apiv2.entegrabilisim.com/product/page=1/?api_sync=1<br>
- Belirli bir tarih aralığında eklenen ürünleri listelemek için.
https://apiv2.entegrabilisim.com/product/page=1/?start_date=2023-01-01&amp;end_date=2023-05-30- Pazaryeri bazlı ürünleri listelemek.
https://apiv2.entegrabilisim.com/product/page=1/?send_supplier=hb


GET
Get Categories
https://apiv2.entegrabilisim.com/category/page=1/
Entegrada mevcut olan kategorileri listeleme.

Parameter	Data Type	In	Description
id	Integer	query	Id değerine göre kategori listeleme
name	String	query	Name değerine göre kategori listeleme
Fitrelemek için örnek sorgular
- Id ile sorgulamak için,
https://apiv2.entegrabilisim.com/category/page=1/?id=7
- Name ile sorgulamak için,
https://apiv2.entegrabilisim.com/category/page=1/?name=Monitör 

NOT : Eğer kategori listelerken "name" parametresi kullanırlırsa, Örnek olarak "Erkek Çocuk El & Sırt Çantası" gibi bir kategoride özel karakter bulunduğu için bu özel karakter(&) dönüştürülmelidir.

HEADERS
Authorization
JWT

Content-Type
application/json

curl
curl --location 'https://apiv2.entegrabilisim.com/category/page=1/' \
--header 'Authorization: JWT ' \
--header 'Content-Type: application/json'

Response : 

{
  "categories": [
    {
      "id": "2",
      "name": "Diğer",
      "productName": "",
      "productDescription": "",
      "sync": "0",
      "description": "",
      "productMetaKeyword": "",
      "productMetaDescription": "",
      "productTag": "",
      "productUrl": "",
      "status": "1",
      "top": "0",
      "sort_order": "0",
      "column": "0",
      "parent_id": "0",
      "ktservis_rate1": "",
      "ktservis_rate2": "",
      "ktservis_rate3": "",
      "ktservis_rate": "",
      "gg": "",
      "n11": "",
      "productDescriptionN11": "",
      "productDescriptionGG": "",
      "wolvox_grup_id": "0",
      "wolvox_ara_grup_id": "0",
      "wolvox_alt_grup_id": "0",
      "flag": "1",
      "supplier": "Manual",
      "path": "",
      "ktservis_rate4": "",
      "ktservis_n11_rate": "",
      "ktservis_gg_rate": "",
      "gg_store_category": "0",
      "meta_description": "",
      "meta_keyword": "",
      "child_count": "0",
      "shipment_cost": "0",
      "no_installment": "0",
      "sp_sanalpazar_category_code": "",
      "sp_sanalpazar_store_category_code": "",
      "productDescriptionSp": "",
      "lamoda_category": "",
      "bamilo_category": "",
      "cdiscount_category": "",
      "eptt_category": "",
      "productDescriptionEptt": "",
      "ozon_category": "",
      "eticaret_category": "",
      "rozetka_category": "",
      "twitter_description": "",
      "facebook_description": "",
      "instagram_description": "",
      "mizu_category": "",
      "zebramo_category": "",
      "zebramo_description": "",
      "productDescriptionTrendyol": "",
      "n11_commission": "0",
      "gg_commission": "0",
      "hb_commission": "0",
      "n11pro_category": "",
      "amazon_product_type": "",
      "amazon_node_id": "",
      "zoodmall_category": "",
      "evideapazaryeri_category": "",
      "evidea_description": "",
      "eptt_commission": "0",
      "horoz_cargo_category": "",
      "trendyol_category": "",
      "aliexpress_category": "",
      "aliexpress_category_name": "",
      "amazonEu_product_type": "",
      "amazonEu_node_id": "",
      "hb_category": "",
      "eanship_category": "",
      "productDescriptionAliexpress": "[description]",
      "trendyol_commission": "0",
      "bpazar_category": "",
      "flo_category": "",
      "productDescriptionFlo": "",
      "flo_commission": "0",
      "joom_product_tags": "",
      "narwoo_category": "",
      "productDescriptionNarwoo": "[description]",
      "aliniyor_category": "",
      "productDescriptionAliniyor": "",
      "productDescriptionBpazar": "[description]",
      "productDescriptionMorhipo": "[description]",
      "needion_category": "",
      "productDescriptionNeedion": "[description]",
      "modanisa_category": "",
      "gordumaldim_category": "",
      "productDescriptionGordumaldim": "[description]",
      "productDescriptionModanisa": "[description]",
      "bisifirat_category": "",
      "productDescriptionBisifirat": "",
      "pazarama_category": "",
      "productDescriptionPazarama": "[description]",
      "vfmall_category": "",
      "productDescriptionVfmall": "[description]",
      "etsy_category": "",
      "iyifiyat_category": "",
      "productDescriptionIyifiyat": "[description]",
      "nevade_category": "",
      "productDescriptionNevade": "[description]",
      "productDescriptionEtsy": "[description]",
      "op1001_category": "",
      "productDescriptionOp1001": "[description]",
      "yapisepeti_category": "",
      "productDescriptionYapisepeti": "[description]",
      "productDescriptionN11pro": "[description]",
      "productDescriptionHepsiburada": "",
      "productDescriptionCiceksepeti": "",
      "productDescriptionWish": "[description]",
      "productDescriptionJoom": "",
      "etolye_category": "",
      "productDescriptionEtolye": "[description]",
      "productDescriptionKintshop": "[description]",
      "kintshop_category": "",
      "productDescriptionGedik": "[description]",
      "supplier_id": "",
      "trendyolgo_category": "",
      "productDescriptionTrendyolgo": "[description]",
      "wish_product_tags": "",
      "gedik_category": "",
      "productDescriptionAmazon": "[description]",
      "name_tree": "Diğer",
      "id_tree": "2",
      "level": "0",
      "name_tree1": "Diğer"
    },



