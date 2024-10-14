import express from "express";
import systemService from "../application/systemService";

const router = express.Router();

// Ruta para ver la lista de sistemas
router.get("/sistemas", async (req, res) => {
  try {
    // Obtener todos los servicios
    const sistemas = await systemService.getAllSystems();
    res.render("sistemas", { sistemas });
  } catch (error) {
    console.error("Error al obtener lista de sistemas:", error);
    res.status(500).render("error", { error: "Error al cargar sistemas" });
  }
});

// Ruta para ver el detalle de un sistema por su ID
router.get("/ver/:encodedId", async (req, res) => {
  try {
    // Decodifica el ID desde Base64
    const decodedId = atob(req.params.encodedId);

    // Obtener sistema específico
    const sistema = await systemService.getSystemById(decodedId);

    if (!sistema) {
      return res
        .status(404)
        .render("error", { error: "Sistema no encontrado" });
    }

    res.render("sistema/ver", { sistema, error: null });
  } catch (error) {
    console.error("Error al obtener sistema por ID:", error);
  }
});

// Ruta para actualizar un sistema existente
router.get("/editar/:encodedId", async (req, res) => {
  try {
    const decodedId = atob(req.params.encodedId); // Decodificar el ID de Base64
    const sistema = await systemService.getUserById(decodedId); // Obtener sistema específico para edición

    if (!sistema) {
      return res
        .status(404)
        .render("error", { error: "Sistema no encontrado" });
    }

    res.render("sistema/editar", {
      sistema,
      success_msg: null,
      error: null,
    });
  } catch (error) {
    console.error("Error al obtener sistema para editar:", error);
    res
      .status(500)
      .render("error", { error: "Error al cargar sistema para edición" });
  }
});
router.post("/editar/:encodedId", async (req, res) => {
  try {
    // Decodificar el ID de Base64
    const decodedId = atob(req.params.encodedId);

    // Extraer datos del cuerpo de la solicitud
    const { sistemaNombre, sistemaDescripcion } = req.body;

    // Crear un objeto solo con los campos que tienen valores
    const newSystemData = {
      ...(sistemaNombre && { nombre: sistemaNombre }),
      ...(sistemaDescripcion && { descripcion: sistemaDescripcion }),
    };

    // Verificar que los campos requeridos no estén vacíos
    if (!sistemaNombre || !sistemaDescripcion) {
      return res.render("sistema/editar", {
        sistema: newSystemData,
        success_msg: null,
        error: "Todos los campos son obligatorios.",
      });
    }

    // Llamar al servicio de sistema para actualizarlo en la base de datos
    const resultado = await systemService.updateSystem(
      decodedId,
      newSystemData
    );

    if (!resultado) {
      return res.render("sistema/editar", {
        sistema: newSystemData,
        error: "No hay cambios a realizar",
      });
    }

    // Redirigir a la vista de edición con mensaje de éxito
    res.render("sistema/editar", {
      sistema: newSystemData,
      success_msg: "Sistema actualizado exitosamente",
      error: null,
    });
  } catch (error) {
    console.error("Error al actualizar sistema:", error);
    res.status(500).render("sistema/editar", {
      sistema: req.body,
      success_msg: null,
      error: "Error al actualizar sistema",
    });
  }
});

// Ruta para agregar un sistema
router.get("/agregar", (req, res) => {
  res.render("sistema/agregar", { error: null, success_msg: null });
});
router.post("/", async (req, res) => {
  try {
    // Extrae los datos del formulario de la solicitud
    const { sistemaNombre, sistemaDescripcion } = req.body;

    // Validar que los campos no estén vacíos
    if (!sistemaNombre || !sistemaDescripcion) {
      return res.status(400).render("sistema/agregar", {
        error: "Todos los campos son obligatorios",
        success_msg: null,
      });
    }

    // Crea un objeto sistema con los datos necesarios
    const nuevoSistema = {
      nombre: sistemaNombre,
      descripcion: sistemaDescripcion,
    };

    // Llama al servicio para crear el sistema
    await systemService.createSystem(nuevoSistema);

    // Redirecciona a la lista de sistemas
    res.render("sistemas", {
      error: null,
      success_msg: "Sistema creado con exito!",
    });
  } catch (error) {
    console.error("Error al agregar sistema:", error);

    // Otros errores
    res.status(500).render("sistema/agregar", {
      error: "Error al agregar sistema",
      success_msg: null,
    });
  }
});

// Ruta para eliminar un sistema
router.post("/eliminar/:encodedId", async (req, res) => {
  try {
    // Decodifica el ID desde Base64
    const decodedId = atob(req.params.encodedId);

    // Llama al servicio para eliminar el servicio
    const servicioEliminado = await userService.deleteUser(decodedId);

    // Verifica si el servicio fue encontrado y eliminado
    if (!servicioEliminado) {
      return res.render("servicios", { error: "Servicio no encontrado" });
    }

    // Enviar una respuesta de éxito
    res.render("servicios", { success_msg: "Servicio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);

    // Responder con un mensaje de error
    res.render("servicios", { error: "Error al eliminar servicio" });
  }
});

export default router;
