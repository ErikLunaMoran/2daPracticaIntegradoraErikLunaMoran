import { Router } from "express";

const cartsRouter = (cartManager) => {
  const router = Router();

  //POST PARA CREAR UN NUEVO CARRITO
  router.post("/", async (req, res) => {
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json({ message: "Carro creado!", newCart }); // 201: Created
    } catch (error) {
      res.status(500).send("Error al crear el carrito");
    }
  });

  //GET PARA LISTAR TODOS LOS CARRITOS
  router.get("/", async (req, res) => {
    try {
      const allCarts = await cartManager.getAllCarts();
      res.json(allCarts);
    } catch (error) {
      res.status(500).send("Error al obtener los carritos");
    }
  });

  //GET PARA OBTENER UN CARRITO EN ESPECIFICO
  router.get("/:cid", async (req, res) => {
    const cid = req.params.cid;
    try {
      const cart = await cartManager.getCartById(cid);
      if (!cart) {
        return res.status(404).send("Carrito no encontrado");
      }

      // Renderiza la vista y pasa el carrito como contexto
      res.render("cartView", { cart });
      /* res.json(cart); */
    } catch (error) {
      res.status(500).send("Error al obtener el carrito");
    }
  });

  //POST PARA AGREGAR PRODUCTOS A UN CARRITO
  router.post("/:cid/product/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;

    if (!quantity || quantity <= 0) {
      return res.status(400).send("Cantidad inválida");
    }

    try {
      const addedProduct = await cartManager.addProductToCart(
        cid,
        pid,
        quantity
      );
      if (!addedProduct) {
        return res.status(404).send("Carrito o producto no encontrado");
      }

      res.status(201).json(addedProduct); // 201: Created
    } catch (error) {
      res.status(500).send("Error al agregar el producto al carrito");
    }
  });

  //DELETE PARA ELIMINAR UN PRODUCTO DE UN CARRITO
  router.delete("/:cid/product/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;

    try {
      const productRemoved = await cartManager.removeProductFromCart(cid, pid);

      if (!productRemoved) {
        return res.status(404).send("Producto no encontrado en el carrito");
      }

      res.status(204).send(); //Indicando que se eliminó con éxito
    } catch (error) {
      res.status(500).send("Error al eliminar el producto del carrito");
    }
  });

  //DELETE PARA ELIMINAR TODOS LOS PRODUCTOS DEL CARRITO
  router.delete("/:cid", async (req, res) => {
    const cid = req.params.cid;

    try {
      const cartEmpty = await cartManager.removeAllProductsFromCart(cid);

      if (!cartEmpty) {
        return res.status(404).send("Carrito no encontrado");
      }

      res.status(204).send(); // 204: No Content, indicando que se eliminaron todos los productos
    } catch (error) {
      res.status(500).send("Error al eliminar los productos del carrito");
    }
  });

  // PUT para actualizar un carrito con un arreglo de productos
  router.put("/:cid", async (req, res) => {
    const cid = req.params.cid;
    const updatedProducts = req.body.products; // Arreglo de productos actualizado

    try {
      const updatedCart = await cartManager.updateCart(cid, updatedProducts);
      if (!updatedCart) {
        return res
          .status(404)
          .send({ status: "error", message: "Carrito no encontrado" });
      }

      // Generar la respuesta con la información solicitada
      const response = {
        status: "success",
        payload: updatedCart.products, // Asegúrate de que esta propiedad sea correcta
        // Otras propiedades como totalDocs, limit, totalPages, etc.
      };

      res.json(response);
    } catch (error) {
      res
        .status(500)
        .send({ status: "error", message: "Error al actualizar el carrito" });
    }
  });

  // PUT para actualizar la cantidad de ejemplares de un producto en un carrito
  router.put("/:cid/products/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;

    if (!quantity || quantity < 0) {
      return res
        .status(400)
        .send({ status: "error", message: "Cantidad inválida" });
    }

    try {
      const updatedProduct = await cartManager.updateProductQuantity(
        cid,
        pid,
        quantity
      );
      if (!updatedProduct) {
        return res.status(404).send({
          status: "error",
          message: "Producto o carrito no encontrado",
        });
      }

      // Respuesta exitosa
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: "Error al actualizar la cantidad del producto en el carrito",
      });
    }
  });

  return router;
};

export default cartsRouter;
