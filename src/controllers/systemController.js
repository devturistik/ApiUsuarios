// src/controllers/systemController.js
import systemService from "../application/systemService.js";

// Renderiza el dashboard de sistemas con todos los sistemas
export const getAllSystems = async (req, res) => {
  try {
    const systems = await systemService.getAllSystems();
    return systems;
  } catch (error) {
    console.error("Error fetching systems:", error);
    res.status(500).json({ error: "Error al obtener los sistemas" });
  }
};

// Crea un sistema y redirige al dashboard
export const createSystem = async (req, res) => {
  try {
    const { sistemaNombre, sistemaDescripcion } = req.body;
    // Validar los campos necesarios
    if (!sistemaNombre || !sistemaDescripcion) {
      return res.render("sistema-agregar", {
        error: "Faltan campos obligatorios.",
        success_msg: null,
      });
    }

    // Intentar crear el sistema
    await systemService.createSystem(sistemaNombre, sistemaDescripcion);

    // Si el sistema se crea con éxito
    return res.render("sistema-agregar", {
      error: null,
      success_msg: "Sistema creado exitosamente.",
    }); // Renderiza con mensaje de éxito
  } catch (error) {
    console.error("Error al crear sistema:", error);
    res.status(500).send("Error al crear el sistema");
  }
};

// Ver detalles de un sistema (para ver y editar)
export const viewSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const system = await systemService.getSystemById(id);
    res.render(req.path.includes("editar") ? "sistema-editar" : "sistema-ver", {
      system,
      error: null,
      success_msg: null,
    });
  } catch (error) {
    res.status(500).send("Error al obtener los detalles del sistema");
  }
};

// Actualiza un sistema existente
export const updateSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { sistemaNombre, sistemaDescripcion } = req.body;
    const systemUpdateData = {
      nombre: sistemaNombre,
      descripcion: sistemaDescripcion,
    };
    await systemService.updateSystem(id, systemUpdateData);
    res.render("sistema-editar", {
      system: { id: id, ...systemUpdateData },
      error: null,
      success_msg: `${sistemaNombre} editado exitosamente!`,
    });
  } catch (error) {
    res.status(500).send("Error al actualizar el sistema");
  }
};

// Elimina un sistema por su id
export const deleteSystem = async (req, res) => {
  try {
    const { id } = req.params;
    await systemService.deleteSystem(id);

    res.status(200).json({
      error: null,
      success_msg: `Sistema con el ID: ${id} eliminado exitosamente!`
    });
  } catch (error) {
    console.error("Error al eliminar el sistema:", error);
    res.status(500).json({
      error: "Error al eliminar el sistema",
      success_msg: null
    });
  }
};
