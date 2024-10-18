"use strict";

$(function () {
  const userAssignmentsTable = $("#userAssignmentsTable");

  if (userAssignmentsTable.length) {
    const encodedUserId = window.location.pathname.split("/").pop();

    const dt = userAssignmentsTable.DataTable({
      serverSide: true,
      ajax: {
        url: `/usuarios-asignar-list/${encodedUserId}`,
        type: "GET",
        data: function (d) {
          // Obtener los valores de los filtros y búsqueda
          const sistemaFilter = $("#filter-sistema").val();
          const rolFilter = $("#filter-rol").val();
          const searchValue = $("#search-input").val();

          // Pasar los parámetros al backend
          return {
            draw: d.draw,
            limit: d.length,
            offset: d.start,
            sistema: sistemaFilter,
            rol: rolFilter,
            search: searchValue,
          };
        },
        dataSrc: function (json) {
          return json.data;
        },
        error: function (xhr, status, error) {
          console.error("Error en la solicitud AJAX:", status, error);
          alert("Error al cargar los sistemas, roles y permisos asignados.");
        },
      },
      columns: [
        { data: "sistema_nombre" },
        { data: "rol_nombre" },
        { data: "permiso_nombre" },
        { data: null },
      ],
      columnDefs: [
        {
          targets: -1,
          title: "Acciones",
          orderable: false,
          render: function (data, type, full) {
            const sistemaId = full["sistema_id"];
            const rolId = full["rol_id"];
            return `<div class="d-inline-block text-nowrap">
                <button class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="ti ti-dots-vertical ti-md"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end m-0">
                  <a href="javascript:void(0);" class="dropdown-item" onclick="removeAssignment('${sistemaId}', '${rolId}')">Eliminar</a>
                </div>
              </div>`;
          },
        },
      ],
      order: [[0, "asc"]],
      dom:
        '<"d-flex flex-column flex-md-row align-items-center justify-content-between mb-3"' +
        '<"me-3"l>' +
        '<"dt-action-buttons d-flex align-items-center flex-wrap gap-2"B>>' +
        ">t" +
        '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      lengthMenu: [7, 10, 20, 50, 70, 100],
      language: {
        sLengthMenu: "_MENU_",
        search: "",
        searchPlaceholder: "Buscar...",
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
            "btn btn-label-secondary dropdown-toggle me-2 waves-effect waves-light",
          text: '<i class="ti ti-download me-1 ti-xs"></i>Exportar',
          buttons: [
            {
              extend: "excelHtml5",
              text: '<i class="ti ti-file-spreadsheet me-2"></i>Excel',
              className: "dropdown-item",
              exportOptions: {
                columns: [0, 1, 2],
              },
              filename:
                "asignaciones_usuario_" + new Date().toLocaleDateString(),
            },
            {
              extend: "pdfHtml5",
              text: '<i class="ti ti-file-description me-2"></i>PDF',
              className: "dropdown-item",
              exportOptions: {
                columns: [0, 1, 2],
              },
              filename:
                "asignaciones_usuario_" + new Date().toLocaleDateString(),
              orientation: "landscape",
              pageSize: "LEGAL",
            },
            {
              extend: "print",
              text: '<i class="ti ti-printer me-2"></i>Imprimir',
              className: "dropdown-item",
              exportOptions: {
                columns: [0, 1, 2],
              },
              filename:
                "asignaciones_usuario_" + new Date().toLocaleDateString(),
            },
          ],
        },
      ],
    });

    // Filtros personalizados
    $("#filter-sistema, #filter-rol").on("change", function () {
      dt.ajax.reload();
    });

    // Barra de búsqueda personalizada
    $("#search-input").on("keyup", function () {
      dt.ajax.reload();
    });

    // Botón para limpiar filtros
    $("#clear-filters").on("click", function () {
      $("#filter-sistema").val("").trigger("change");
      $("#filter-rol").val("").trigger("change");
      $("#search-input").val("");
      dt.ajax.reload();
    });

    // Ajuste de elementos de longitud y botones
    $(".dataTables_length").addClass("mx-n2");
    $(".dt-buttons").addClass("d-flex flex-wrap mb-4 mb-sm-0");

    // Función para eliminar una asignación
    window.removeAssignment = function (sistemaId, rolId) {
      const encodedUserId = window.location.pathname.split("/").pop();
      if (confirm("¿Estás seguro de que quieres eliminar esta asignación?")) {
        fetch(`/usuarios-asignar-eliminar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuarioId: encodedUserId,
            sistemaId: sistemaId,
            rolId: rolId,
          }),
        })
          .then((response) => {
            if (response.ok) {
              dt.ajax.reload(); // Recargar la tabla sin refrescar la página
              alert("Asignación eliminada exitosamente.");
            } else {
              alert("Error al eliminar la asignación.");
            }
          })
          .catch((error) => {
            console.error("Error en la solicitud:", error);
            alert("Error al eliminar la asignación.");
          });
      }
    };
  }
});
