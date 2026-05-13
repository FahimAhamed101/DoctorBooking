const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createStripeCustomer = async (customerData) => {
  const existCustomer = await findStripeCustomerByEmail(customerData.email);

  if (existCustomer) {
    console.log("Customaer alrady exiest ID id:", existCustomer.id);
    return existCustomer;
  }

  const customer = await stripe.customers.create({
    email: customerData.email,
    name: customerData.fullName,
    phone: customerData?.phoneNumber || "",
    metadata: { userId: customerData.userId },
  });

  return customer;
};

const findStripeCustomerByEmail = async (email) => {
  const customers = await stripe.customers.list({ email });
  return customers.data[0];
};

const getAllStripeSubscriptions = async (limit) => {
  const subscriptions = await stripe.subscriptions.list({
    limit: limit,
  });
  return subscriptions;
};

const takeSubscription = async (customer, subData) => {
  const stripeCustomer = await findStripeCustomerByEmail(subData.email);

  const userEmail = String(subData.email);
  const userId = String(subData.userId);

  if (stripeCustomer.default_source === null) {
    console.log("No payment mathord add the customer");
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customer,
      mode: "subscription",
      line_items: [
        {
          price: subData.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        email: userEmail,
        priceId: subData.priceId,
        subscriptionLimitation: subData.subscriptionLimitation,
      },
      payment_method_options: {
        card: {
          request_three_d_secure: "any",
        },
      },
      success_url: "https://trustedgpclinic.com",
      cancel_url: "https://trustedgpclinic.com/contact",
    });

    return checkoutSession;
  }

  // If customer has a payment source, create the subscription ==>
  const subscription = await stripe.subscriptions.create({
    customer: customer,
    items: [
      {
        price: subData.priceId,
      },
    ],
    metadata: {
      userId: subData.userId,
    },
  });

  return subscription;
};

const stripeOneTimePayment = async (paymentData) => {

  if(paymentData.type === "guest" && !paymentData.deviceGUID){
    throw new ApiError(httpStatus.BAD_REQUEST, "Device GUID is required for guest payments");
  }


  const userId = paymentData.metadata.userId ? String(paymentData.metadata.userId) : null;
  const deviceGUID = paymentData.metadata.deviceGUID ? String(paymentData.metadata.deviceGUID) : null;
  const userEmail = String(paymentData.metadata.email);
  const appointmentId = String(paymentData.metadata.appointmentId);
  const description = String(paymentData.metadata.description);

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: paymentData.currency || "usd",
          product_data: {
            name: paymentData.name,
          },
          unit_amount: paymentData.amount * 100,
        },
        quantity: paymentData.quantity,
      },
    ],
    metadata: {
      userId: userId,
      deviceGUID: deviceGUID,
      email: userEmail,
      appointmentId: appointmentId,
      description: description,
    },
    success_url: "https://trustedgpclinic.com",
    cancel_url: "https://trustedgpclinic.com/contact",
  });

  return checkoutSession;
};


module.exports = {
  createStripeCustomer,
  findStripeCustomerByEmail,
  getAllStripeSubscriptions,
  takeSubscription,
  stripeOneTimePayment,
};
