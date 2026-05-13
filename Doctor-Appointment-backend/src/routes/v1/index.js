const express = require("express");
const config = require("../../config/config");
const authRoute = require("./auth.routes");
const userRoute = require("./user.routes");
const adminRoute = require("./admin.routes");
const docsRoute = require("./docs.routes");
const subscriptionRoute = require("./subscription.routes");
const teamRoute = require("./team.routes");
const documentRoute = require("./document.routes");
const faqRoute = require("./faq.routes");
const infoRoute = require("./info.routes");
const blogRoute = require("./blog.routes");
const geminiRoute = require("./gemini.routes");
const scheduleRoute = require("./schedule.routes");
const contactRoute = require("./contact.routes");
const appointmentRoute = require("./appointment.routes");
const valuesRoute = require("./values.routes");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/subscription",
    route: subscriptionRoute,
  },
  {
    path: "/faq",
    route: faqRoute,
  },
  {
    path: "/team",
    route: teamRoute,
  },
  {
    path: "/document",
    route: documentRoute,
  },
  {
    path: "/schedule",
    route: scheduleRoute,
  },
  {
    path: "/contact",
    route: contactRoute,
  },
  {
    path: "/gemini",
    route: geminiRoute,
  },
  {
    path: "/appointment",
    route: appointmentRoute,
  },
  {
    path: "/blogs",
    route: blogRoute,
  },
  {
    path: "/values",
    route: valuesRoute,
  },
  {
    path: "/info",
    route: infoRoute,
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
