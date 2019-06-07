const router = require("express").Router();
const paypal = require("paypal-rest-sdk");
const paypalConfig = require("../config/paypal");

paypal.configure(paypalConfig);

const { credits } = require(`../config/credits.json`);

router.get("/", (req, res) => res.render("index", { credits }));

router.post("/buy", (req, res) => {
  const creditId = req.query.id;
  const credit = credits.reduce((all, item) =>
    item.id === creditId ? credit : all
  );
  if (!credit.id) return res.render("index", { credits });

  const cart = [
    {
      name: credit.titulo,
      sku: credit.id,
      price: credit.preco.toFixed(2),
      currency: "BRL",
      quantity: 1
    }
  ];

  const valor = { currency: "BRL", total: credit.preco.toFixed(2) };
  const descricao = credit.descricao;

  const jsonPagamento = {
    intent: "sale",
    payer: { payment_method: "paypal" },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    },
    transactions: [
      {
        item_list: { items: cart },
        amount: valor,
        description: descricao
      }
    ]
  };

  paypal.payment.create(jsonPagamento, (err, pagamento) => {
    if (err) console.log(err);
    else {
      pagamento.links.forEach(link => {
        if (link.rel === "approval_url") return res.redirect(link.href);
      });
    }
  });
});

router.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const valor = {
    currency: "BRL",
    total: 100
  };
  const executePaymentJson = {
    payer_id: payerId,
    transactions: [{ amount: valor }]
  };
  paypal.payment.execute(paymentId, executePaymentJson, (err, payment) => {
    if (err) console.warn(err);
    else {
      console.log("Pagamento concluído com sucesso");
      console.log(JSON.stringify(payment));
      res.send("success");
    }
  });
});

router.get("/cancel", (req, res) => {
  res.send("cancel");
});

module.exports = router;
