const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { roleRights } = require("../config/roles");
const jwt = require("jsonwebtoken");
const { Activity } = require("../models");

const verifyCallback =
  (req, resolve, reject, requiredRights) => async (err, user, info) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized")
      );
    }
    req.user = user;

    let token = null;
    const { authorization, cookie } = req.headers;

    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
    } 
    // console.log("no token", token)

    if (!token) {
      console.log("No token")
      token = req.cookies.accessToken; 
    }



    if (token) {
      let decodedData;
      try {
        decodedData = jwt.decode(token);
      } catch (error) {
        return reject(
          new ApiError(httpStatus.UNAUTHORIZED, "Invalid token")
        );
      }

      const activity = decodedData?.activity;

    } else {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, "Token not found"));
    }

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }

    resolve();
  };


const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
