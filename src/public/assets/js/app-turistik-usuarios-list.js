"use strict";

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
  const dtUserTable = $("#usuariosTable");

  if (dtUserTable.length) {
    const dt = dtUserTable.DataTable({
      serverSide: true,
      deferRender: true,
      processing: true,
      ajax: {
        url: "/usuarios-list",
        type: "GET",
        data: function (d) {
          // Obtener los valores de los filtros y búsqueda
          const estadoFilter = $("#filter-activo").val();
          const searchValue = d.search.value;

          // Aquí pasamos parámetros de paginación al backend
          return {
            draw: d.draw, // El contador que usa DataTables para la paginación
            limit: d.length, // Número de usuarios por página (definido en la tabla)
            offset: d.start, // El índice inicial de los usuarios a mostrar
            estado: estadoFilter,
            search: searchValue,
          };
        },
        dataSrc: function (json) {
          // Contadores
          $("#total-users").text(json.recordsTotal);
          $("#active-users").text(json.totalActivos);
          $("#inactive-users").text(json.totalInactivos);
          return json.data;
        },
        error: function (xhr, status, error) {
          console.error("Error en la solicitud AJAX:", status, error);
          alert("Error al cargar datos de usuarios.");
        },
      },
      columns: [
        { data: null },
        { data: "id" },
        { data: "nombre" },
        { data: "apellido" },
        { data: "departamento" },
        { data: "correo" },
        { data: "activo" },
        { data: null },
      ],
      columnDefs: [
        {
          targets: 0,
          orderable: false,
          checkboxes: {
            selectAllRender: '<input type="checkbox" class="form-check-input">',
          },
          render: () =>
            '<input type="checkbox" class="dt-checkboxes form-check-input">',
          searchable: false,
        },
        {
          targets: 1,
          render: (data) => `<span>${data}</span>`,
        },
        {
          targets: 6,
          render: (data) => {
            const statusClass = data ? "bg-label-success" : "bg-label-danger";
            const statusText = data ? "Activo" : "Inactivo";
            return `<span class="${statusClass}">${statusText}</span>`;
          },
        },
        {
          targets: -1,
          title: "Acciones",
          orderable: false,
          render: function (data, type, full) {
            const encodedId = full["id"];
            return `<div class="d-inline-block text-nowrap">
                <button class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect waves-light dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="ti ti-dots-vertical ti-md"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end m-0">
                  <a href="javascript:void(0);" class="dropdown-item" onclick="viewUser('${encodedId}')">Ver</a>
                  <a href="javascript:void(0);" class="dropdown-item" onclick="editUser('${encodedId}')">Editar</a>
                  <a href="javascript:void(0);" class="dropdown-item" onclick="deleteUser('${encodedId}', this)">Suspender</a>
                  <a href="javascript:void(0);" class="dropdown-item" onclick="assign('${encodedId}')">Asignar Sistema</a>
                </div>
              </div>`;
          },
        },
      ],
      order: [[1, "asc"]],
      dom: "lBfrtip",
      lengthMenu: [7, 10, 20, 50, 70, 100], // Opciones de número de filas por página
      language: {
        sLengthMenu: "_MENU_",
        search: "",
        searchPlaceholder: "Buscar Usuario",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        paginate: {
          next: '<i class="ti ti-chevron-right ti-sm"></i>',
          previous: '<i class="ti ti-chevron-left ti-sm"></i>',
        },
      },
      buttons: [
        {
          extend: "collection",
          className: "btn btn-label-secondary dropdown-toggle me-2",
          text: '<i class="ti ti-upload me-1 ti-xs"></i>Exportar',
          buttons: [
            {
              extend: "excelHtml5",
              text: '<i class="ti ti-file-text me-2"></i>Excel',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "usuarios_" + new Date().toLocaleDateString(),
            },
            {
              extend: "pdfHtml5",
              text: '<i class="ti ti-file-text me-2"></i>PDF',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "usuarios_" + new Date().toLocaleDateString(),
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
              filename: "usuarios_" + new Date().toLocaleDateString(),
            },
            {
              extend: "copyHtml5",
              text: '<i class="ti ti-copy me-2"></i>Copiar',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "usuarios_" + new Date().toLocaleDateString(),
            },
            {
              extend: "csvHtml5",
              text: '<i class="ti ti-file me-2"></i>CSV',
              className: "dropdown-item",
              exportOptions: {
                columns: ":visible",
              },
              filename: "usuarios_" + new Date().toLocaleDateString(),
            },
          ],
        },
      ],
      initComplete: function () {
        // Mostrar los controles solo después de que DataTables haya cargado
        $("#dataTables-controls").removeClass("invisible");

        // Inicializar Select2 en el filtro activo
        $("#filter-activo").select2({
          width: "100%",
          placeholder: "Estado",
          minimumResultsForSearch: Infinity,
        });

        // Evento para el filtro activo
        $("#filter-activo").on("change", function () {
          dt.ajax.reload();
        });

        // Evento para el botón "Agregar Usuario"
        $("#btn-agregar-usuario").on("click", function () {
          window.location.href = `/usuarios-agregar`;
        });

        // Barra de búsqueda
        $("#dataTables-search").append($(".dataTables_filter"));
        $(".dataTables_filter")
          .removeClass("dataTables_filter")
          .addClass("mb-0");

        // Menú de longitud
        $("#dataTables-length").append($(".dataTables_length"));
        $(".dataTables_length")
          .removeClass("dataTables_length")
          .addClass("mb-0");

        // Botones
        $("#dataTables-buttons").append($(".dt-buttons"));
        $(".dt-buttons").removeClass("dt-buttons btn-group").addClass("mb-0");

        // Ajustar el placeholder de la barra de búsqueda
        $(".dataTables_filter input").attr("placeholder", "Buscar Usuario");
      },
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

    // Eventos de búsqueda con debounce
    let typingTimer;
    const typingInterval = 500; // Tiempo en milisegundos

    $("#dataTables-search input").on("keyup", function () {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(function () {
        dt.search($("#dataTables-search input").val()).draw();
      }, typingInterval);
    });

    $("#dataTables-search input").on("keydown", function () {
      clearTimeout(typingTimer);
    });

    // Ver usuario
    window.viewUser = function (encodedId) {
      window.location.href = `/usuarios/${encodedId}`; // Redirigir a la ruta
    };

    // Editar usuario
    window.editUser = function (encodedId) {
      window.location.href = `/usuarios-editar/${encodedId}`;
    };

    // Eliminar usuario (marcar eliminado = 1)
    window.deleteUser = function (encodedId) {
      if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
        // Realizar la solicitud POST para eliminar el usuario
        fetch(`/usuarios-eliminar/${encodedId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              location.reload();
              alert("Usuario eliminado exitosamente.");
            } else {
              alert("Error al eliminar el usuario.");
            }
          })
          .catch((error) => {
            console.error("Error en la solicitud:", error);
            alert("Error al eliminar el usuario.");
          });
      }
    };

    window.assign = function (encodedId) {
      window.location.href = `/usuarios-asignar/${encodedId}`;
    };
  }
});
