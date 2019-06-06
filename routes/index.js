const { Router } = require('express');
const router = Router();
const path = require('path');
const puppeteer = require('puppeteer');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let nombre, precio, nombre_producto, descripcion, num_factura;

router.get('/', (req, res) => {

  res.render('index');
});

router.get('/export/html', async (req, res) => {
 
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  let fecha = dd + "/" + mm + "/" + yyyy;



  const templateData = {
    "purchase_date": fecha,
    "nombre": nombre,
    "total": precio,
    "duedate": fecha,
    "ProductName": nombre_producto,
    "action_url": "url",
    "amount": precio,
    "description": descripcion,
    "support_url": "http://shop.com/support",
    "invoice_id" : num_factura,
    "action_url" : "http://shop.com/url"

  }
  res.render('template', { templateData });


});

router.post('/export/pdf', async (req, res) => {


  const { name, name_product, price, invoice_id, description_product } = req.body;
  nombre = name;
  precio = price;
  nombre_producto = name_product;
  descripcion = description_product;
  num_factura = invoice_id;

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/export/html', { waitUntil: 'networkidle0' });
  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    PreferCSSPageSize: true
  });

  if (req.body['send_email'] != null) {

    let base64data = buffer.toString('base64');

    const msg = {
      to: email,
      bcc: ['test@gmail.com','test2@gmail.com'],
      from: 'support@gmail.com',
      subject: '¡ ' + nombre + ' tu compra está lista!',
      html: `
      <p>Estimado cliente, adjunto encontrar la factura de su compra, como comprobante de su compra</p
     `,
      attachments: [
        {
          content: base64data,
          filename: 'factura-shop.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
          contentId: 'myPDF_1234'
        },
      ],
    };

    sgMail.send(msg);


  }

  if (req.body['pdf'] == null){
    res.type('application/pdf');
    res.send(buffer);
  } else {
    res.send('ok');
  }

  browser.close();


})

module.exports = router;