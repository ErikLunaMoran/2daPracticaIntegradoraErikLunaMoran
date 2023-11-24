//Dependencias
import express from "express";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import { Server } from "socket.io";

//Sesiones
import MongoStore from "connect-mongo";
import session from "express-session";

//Passport
import passport from "passport";
import initializePassport from "./config/passport.config.js";

//Routes
import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/cartsRouter.js";
import userRouter from "./routes/userRouter.js";
//Managers
/* import ProductManager from "./manager/ProductManager.js"; */
import CartManager from "./dao/db/CartsManager.js";
//Models
import { mensajeModel } from "./dao/models/messages.model.js";
import cookieParser from "cookie-parser";

//conexion a la base de datos ecommerce
mongoose.connect(
  "mongodb+srv://lunamoranerik:dPD7hggiuqpQOBkR@cluster0.svnnjjy.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=AtlasApp"
);

const app = express();
//guardar instancia de servidor en una variable
const httpServer = app.listen(8080, () => console.log("encendido"));
const socketServer = new Server(httpServer);

const cartManager = new CartManager();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Handelbars motor
app.engine("handlebars", handlebars.engine());
app.set("views", "./src/views");
app.set("view engine", "handlebars");

app.use("/static", express.static("./public")); //servidor capaz de entregar archivos estaticos
/* app.use(viewsRouter); */

//PRODUCTOS ENDPOINT
app.use("/api/products", productsRouter);

//SESIONES
app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://lunamoranerik:dPD7hggiuqpQOBkR@cluster0.svnnjjy.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=AtlasApp",
      ttl: 15,
    }),
    secret: "dxjimopcfvsdfv24$nbg9w4ro",
    resave: false,
    saveUninitialized: false,
  })
);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use("/api", userRouter);
/* app.use("/jwt", jwtRouter); */
app.use("/", viewsRouter);

//MENSAJES
socketServer.on("connection", (socket) => {
  console.log("Se conectó", socket.id);
  socket.on("mensaje", async (data) => {
    await mensajeModel.create(data);
    const mensajes = await mensajeModel.find().lean();
    console.log(mensajes);
    socketServer.emit("nuevo_mensaje", mensajes);
  });
});

//CARRITOS ENDPOINT
app.use("/api/carts", cartsRouter(cartManager));
