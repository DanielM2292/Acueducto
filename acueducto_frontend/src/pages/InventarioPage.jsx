import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InventarioPage = () => {
  const [formData, setFormData] = useState({
    id_producto: "",
    descripcion_producto: "",
    cantidad: "",
    valor_producto: "",
  });

  const [productos, setProductos] = useState([]);

  const notify = (message, type) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:9090/productos/agregar_producto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descripcion_producto: formData.descripcion_producto,
          cantidad: formData.cantidad,
          valor_producto: formData.valor_producto
        }),
      });
      const data = await response.json();
      if (response.ok) {
        notify("Producto agregado exitosamente", "success");
        setFormData({ id_producto: "", descripcion_producto: "", cantidad: "", valor_producto: "" });
        fetchAllProducts();
      } else {
        notify(data.message || "Error al agregar el producto", "error");
      }
    } catch (error) {
      notify("Error de conexión con el servidor", "error");
      console.error("Error:", error);
    }
  };

  const fetchProductById = async () => {
    try {
      const response = await fetch(`http://localhost:9090/productos/buscar_producto?id_producto=${formData.id_producto}`);
      const data = await response.json();
      if (response.ok) {
        setFormData({
          id_producto: data.id_producto,
          descripcion_producto: data.descripcion_producto,
          cantidad: data.cantidad,
          valor_producto: data.valor_producto,
        });
      } else {
        notify("Error al obtener el producto", "error");
      }
    } catch (error) {
      notify("Error de conexión con el servidor", "error");
      console.error("Error:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch("http://localhost:9090/productos/buscar_todos_productos");
      const data = await response.json();
      if (response.ok) {
        setProductos(data);
      } else {
        notify("Error al obtener los productos", "error");
      }
    } catch (error) {
      notify("Error de conexión con el servidor", "error");
      console.error("Error:", error);
    }
  };

  const searchProductsByKeyword = async () => {
    try {
      const response = await fetch(`http://localhost:9090/productos/buscar_productos_por_palabra?palabra_clave=${formData.descripcion_producto}`);
      const data = await response.json();
      if (response.ok) {
        setProductos(data);
      } else {
        notify("Error al buscar los productos", "error");
      }
    } catch (error) {
      notify("Error de conexión con el servidor", "error");
      console.error("Error:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`http://localhost:9090/productos/actualizar_producto?id_producto=${formData.id_producto}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        notify("Producto actualizado exitosamente", "success");
        setFormData({ id_producto: "", descripcion_producto: "", cantidad: "", valor_producto: "" });
        fetchAllProducts();
      } else {
        notify(data.message || "Error al actualizar el producto", "error");
      }
    } catch (error) {
      notify("Error de conexión con el servidor", "error");
      console.error("Error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:9090/productos/eliminar_producto?id_producto=${formData.id_producto}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        notify("Producto eliminado exitosamente", "success");
        setFormData({ id_producto: "", descripcion_producto: "", cantidad: "", valor_producto: "" });
        fetchAllProducts();
      } else {
        notify(data.message || "Error al eliminar el producto", "error");
      }
    } catch (error) {
      notify("Error de conexión con el servidor", "error");
      console.error("Error:", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return (
    <div className="InventarioPage">
      <ToastContainer />
      <h1 className="pagesTitle">Inventario</h1>
      <form className="FormContainer" onSubmit={handleSubmit}>
        <div className="inputsRow">
          <div className="group">
            <input
              type="text"
              name="id_producto"
              value={formData.id_producto}
              onChange={handleChange}
              required
              className="input"
            />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label>ID Producto</label>
          </div>
          <div className="group">
            <input
              type="text"
              name="descripcion_producto"
              value={formData.descripcion_producto}
              onChange={handleChange}
              required
              className="input"
            />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label>Descripción</label>
          </div>
          <div className="group">
            <input
              type="text"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              required
              className="input"
            />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label>Cantidad</label>
          </div>
          <div className="group">
            <input
              type="text"
              name="valor_producto"
              value={formData.valor_producto}
              onChange={handleChange}
              required
              className="input"
            />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label>Valor</label>
          </div>
        </div>
        <div className="buttons">
          <button className="crudBtn" type="submit">Agregar</button>
          <button className="crudBtn" type="button" onClick={fetchAllProducts}>Mostrar Todos</button>
          <button className="crudBtn" type="button" onClick={searchProductsByKeyword}>Buscar</button>
          <button className="crudBtn" type="button" onClick={handleEdit}>Editar</button>
          <button className="btnEliminar" type="button" onClick={handleDelete}>Eliminar</button>
        </div>
      </form>
      <div className="ProductList">
        <h2 className="ListProductTittle">Resultados de la Búsqueda:</h2>
        <div className="productTable">
          <div className="productTableHeader">
            <div>ID Producto</div>
            <div>Descripción</div>
            <div>Cantidad</div>
            <div>Valor</div>
            <div>Fecha</div>
          </div>
          <div className="productTableBody">
            {productos.length > 0 ? (
              productos.map((product) => (
                <div key={product.id_producto} className="productTableRow">
                  <div>{product.id_producto}</div>
                  <div>{product.descripcion_producto}</div>
                  <div>{product.cantidad}</div>
                  <div>{formatCurrency(product.valor_producto)}</div>
                  <div>{new Date(product.fecha_producto).toLocaleDateString()}</div>
                </div>
              ))
            ) : (
              <p>No se encontraron productos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventarioPage;
