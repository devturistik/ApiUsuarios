"use strict";

// Inicialización del DataTable (jQuery)
$(function () {
  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  const dtSystemTable = $("#sistemasTable");

  // Inicialización del DataTable
  if (dtSystemTable.length) {
    const dt = dtSystemTable.DataTable({
      serverSide: true,
      deferRender: true,
      processing: true,
      ajax: {
        url: "/sistemas-list",
        type: "GET",
        data: function (d) {
          return {
            draw: d.draw, // El contador que usa DataTables para la paginación
            limit: d.length, // Número de sistemas por página
            offset: d.start, // Índice inicial
          };
        },
        dataSrc: function (json) {
          // Actualizamos el contador total de sistemas
          $("#total-systems").text(json.recordsTotal);
          return json.data; // Retornamos los datos al DataTable
        },
        error: function (xhr, status, error) {
          console.error("Error en la solicitud AJAX:", status, error);
          alert("Error al cargar datos de sistemas.");
        },
      },
      columns: [
        { data: null }, // Checkbox
        { data: "id" }, // ID
        { data: "nombre" }, // Nombre
        { data: "descripcion" }, // Descripcion
        { data: null }, // Placeholder para acciones
      ],
      columnDefs: [
        {
          targets: 0, // Checkbox
          orderable: false,
          checkboxes: {
            selectAllRender: '<input type="checkbox" class="form-check-input">',
          },
          render: () =>
            '<input type="checkbox" class="dt-checkboxes form-check-input">',
          searchable: false,
        },
        {
          targets: 1, // ID
          render: (data) => `<span>${data}</span>`,
        },
        {
          targets: 2, // Nombre
          render: (data) => `<span>${data}</span>`,
        },
        {
          targets: 3, // Descripcion
          render: (data) => `<span>${data}</span>`,
        },
        {
          targets: -1,
          title: "Acciones",
          orderable: false,
          render: function (data, type, full) {
            const encodedId = full["id"];
            const nombre = full["nombre"];
            return `<div class="d-inline-block text-nowrap">
                <button class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect waves-light dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="ti ti-dots-vertical ti-md"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end m-0">
                  <a href="javascript:void(0);" class="dropdown-item" onclick="viewSystem('${encodedId}')">Ver</a>
                  <a href="javascript:void(0);" class="dropdown-item" onclick="editSystem('${encodedId}')">Editar</a>
                  <a href="javascript:void(0);" class="dropdown-item" onclick="deleteSystem('${encodedId}', this)">Suspender</a>
                </div>
              </div>`;
          },
        },
      ],
      order: [[1, "asc"]],
      dom:
        '<"card-header d-flex border-top rounded-0 flex-wrap py-0 flex-column flex-md-row align-items-start"' +
        '<"me-5 ms-n4 pe-5 mb-n6 mb-md-0"f>' +
        '<"d-flex justify-content-start justify-content-md-end align-items-baseline"<"dt-action-buttons d-flex flex-column align-items-start align-items-sm-center justify-content-sm-center pt-0 gap-sm-4 gap-sm-0 flex-sm-row"lB>>' +
        ">t" +
        '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      lengthMenu: [7, 10, 20, 50, 70, 100], // Opciones de número de filas por página
      language: {
        sLengthMenu: "_MENU_",
        search: "",
        searchPlaceholder: "Buscar Sistema",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        paginate: {
          next: '<i class="ti ti-chevron-right ti-sm"></i>',
          previous: '<i class="ti ti-chevron-left ti-sm"></i>',
        },
      },
      buttons: [
        {
          extend: "collection",
          className:
            "btn btn-label-secondary dropdown-toggle me-4 waves-effect waves-light",
          text: '<i class="ti ti-upload me-1 ti-xs"></i>Exportar',
          buttons: [
            {
              extend: "excelHtml5",
              text: '<i class="ti ti-file-text me-2"></i>Excel',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "sistemas_" + new Date().toLocaleDateString(),
            },
            {
              extend: "pdfHtml5",
              text: '<i class="ti ti-file-text me-2"></i>PDF',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "sistemas_" + new Date().toLocaleDateString(),
              orientation: "landscape",
              pageSize: "LEGAL",
            },
            {
              extend: "print",
              text: '<i class="ti ti-printer me-2"></i>Imprimir',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "sistemas_" + new Date().toLocaleDateString(),
            },
            {
              extend: "copyHtml5",
              text: '<i class="ti ti-copy me-2"></i>Copiar',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "sistemas_" + new Date().toLocaleDateString(),
            },
            {
              extend: "csvHtml5",
              text: '<i class="ti ti-file me-2"></i>CSV',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "sistemas_" + new Date().toLocaleDateString(),
            },
          ],
        },
        {
          text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Agregar Sistema </span>',
          className:
            "add-new btn btn-primary ms-2 ms-sm-0 waves-effect waves-light",
          action: function () {
            window.location.href = `/sistemas-agregar`;
          },
        },
      ],
      // responsive: {
      //   details: {
      //     display: $.fn.dataTable.Responsive.display.modal({
      //       header: function (row) {
      //         var data = row.data();
      //         return "Detalles de " + data["nombre"];
      //       },
      //     }),
      //     type: "column",
      //     renderer: function (api, rowIdx, columns) {
      //       var data = $.map(columns, function (col) {
      //         return col.title !== ""
      //           ? '<tr data-dt-row="' +
      //               col.rowIndex +
      //               '" data-dt-column="' +
      //               col.columnIndex +
      //               '">' +
      //               "<td>" +
      //               col.title +
      //               ":</td> " +
      //               "<td>" +
      //               col.data +
      //               "</td>" +
      //               "</tr>"
      //           : "";
      //       }).join("");

      //       return data
      //         ? $('<table class="table"/><tbody />').append(data)
      //         : false;
      //     },
      //   },
      // },
    });

    // Filtros personalizados
    $("#filter-depto").on("change", function () {
      dt_products.column(4).search($(this).val()).draw(); // Filtrar por departamento
    });

    $("#filter-activo").on("change", function () {
      dt_products.column(6).search($(this).val()).draw(); // Filtrar por estado activo
    });

    // Ajuste de elementos de longitud y botones
    $(".dataTables_length").addClass("mx-n2");
    $(".dt-buttons").addClass("d-flex flex-wrap mb-6 mb-sm-0");
  }

  // Ver sistema
  window.viewSystem = function (encodedId) {
    window.location.href = `/sistemas/${encodedId}`; // Redirigir a la ruta
  };

  // Editar sistema
  window.editSystem = function (encodedId) {
    window.location.href = `/sistemas-editar/${encodedId}`;
  };

  window.deleteSystem = function (encodedId) {
    if (confirm("¿Estás seguro de que quieres eliminar este sistema?")) {
      // Realizar la solicitud POST para eliminar el sistema
      fetch(`/sistemas-eliminar/${encodedId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            location.reload();
            alert("Sistema eliminado exitosamente.");
          } else {
            alert("Error al eliminar el sistema.");
          }
        })
        .catch((error) => {
          console.error("Error en la solicitud:", error);
          alert("Error al eliminar el sistema.");
        });
    }
  };
});
