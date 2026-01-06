const messages = {
  es: {
    translations: {
      selectLanguage: "Seleccione un idioma",
      signup: {
        title: "Regístrate",
        toasts: {
          success: "¡Usuario creado con éxito! ¡Inicia sesión!!!",
          fail: "Error al crear usuario. Verifica los datos ingresados.",
        },
        form: {
          name: "Nombre de la empresa",
          email: "Correo electrónico",
          phone: "Teléfono con (código de área)",
          plan: "Plan",
          password: "Contraseña",
        },
        formErrors: {
          name: {
            required: "El nombre de la empresa es obligatorio",
            short: "Nombre demasiado corto",
            long: "Nombre demasiado largo",
          },
          password: {
            short: "Contraseña demasiado corta",
            long: "Contraseña demasiado larga",
          },
          email: {
            required: "El correo electrónico es obligatorio",
            invalid: "Correo electrónico inválido",
          },
        },
        buttons: {
          submit: "Registrar",
          login: "¿Ya tienes una cuenta? ¡Inicia sesión!",
        },
        plan: {
          attendant: "Asistente",
          whatsapp: "WhatsApp",
          queues: "Colas",
        },
      },
      login: {
        title: "Iniciar sesión",
        form: {
          email: "Correo electrónico",
          password: "Contraseña",
        },
        buttons: {
          submit: "Entrar",
          register: "¡Regístrate ahora mismo!",
        },
      },
      resetPassword: {
        title: "Restablecer Contraseña",
        toasts: {
          emailSent: "¡Correo enviado con éxito!",
          emailNotFound: "¡Correo electrónico no encontrado!",
          passwordUpdated: "¡Contraseña actualizada con éxito!",
        },
        formErrors: {
          email: {
            required: "El correo electrónico es obligatorio",
            invalid: "Correo electrónico inválido",
          },
          newPassword: {
            required: "La nueva contraseña es obligatoria",
            matches:
                "Tu contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una minúscula y un número.",
          },
          confirmPassword: {
            required: "La confirmación de contraseña es obligatoria",
            matches: "Las contraseñas no coinciden",
          },
        },
        form: {
          email: "Correo electrónico",
          verificationCode: "Código de verificación",
          newPassword: "Nueva contraseña",
          confirmPassword: "Confirmar nueva contraseña",
        },
        buttons: {
          submitEmail: "Enviar correo",
          submitPassword: "Restablecer contraseña",
          back: "¿No tienes una cuenta? ¡Regístrate!",
        },
      },
      dashboard: {
        toasts: {
          selectFilterError: "Parametrice el filtro",
              userChartError: "Error al obtener información de la conversación",
              dateChartError: "Error al obtener información de la conversación",
        },
        filters: {
          initialDate: "Fecha Inicial",
              finalDate: "Fecha Final",
              filterType: {
            title: "Tipo de Filtro",
                options: {
              perDate: "Filtro por Fecha",
                  perPeriod: "Filtro por Período",
            },
            helper: "Seleccione el tipo de filtro deseado",
          },
        },
        periodSelect: {
          title: "Período",
              options: {
            none: "Ninguno seleccionado",
                last3: "Últimos 3 días",
                last7: "Últimos 7 días",
                last15: "Últimos 15 días",
                last30: "Últimos 30 días",
                last60: "Últimos 60 días",
                last90: "Últimos 90 días",
          },
          helper: "Seleccione el período deseado",
        },
        counters: {
          inTalk: "En conversación",
              waiting: "En espera",
              finished: "Finalizados",
              newContacts: "Nuevos contactos",
              averageTalkTime: "T.M. de Conversación",
              averageWaitTime: "T.M. de Espera",
        },
        buttons: {
          filter: "Filtrar",
        },
        onlineTable: {
          ratingLabel: "1 - Insatisfecho, 2 - Satisfecho, 3 - Muy Satisfecho",
              name: "Nombre",
              ratings: "Evaluaciones",
              avgSupportTime: "T.M. de Atención",
              status: "Estado (Actual)",
        },
        charts: {
          user: {
            label: "Gráfico de Conversaciones",
                title: "Total de Conversaciones por Usuarios",
                start: "Inicio",
                end: "Fin",
                filter: "Filtrar",
          },
          date: {
            label: "Gráfico de Conversaciones",
                title: "Total",
                start: "Inicio",
                end: "Fin",
                filter: "Filtrar",
          },
        },
      },
      plans: {
        toasts: {
          errorList: "No fue posible cargar la lista de registros",
          errorOperation: "No fue posible realizar la operación",
          error: "No fue posible realizar la operación. Verifique si ya existe un plan con el mismo nombre o si los campos fueron completados correctamente",
          success: "¡Operación realizada con éxito!",
        },
        confirm: {
          title: "Eliminación de Registro",
          message: "¿Realmente desea eliminar el registro?",
        },
        form: {
          name: "Nombre",
          users: "Usuarios",
          connections: "Conexiones",
          queues: "Colas",
          value: "Valor",
          internalChat: "Chat Interno",
          externalApi: "API Externa",
          kanban: "Kanban",
          integrations: "Integraciones",
          campaigns: "Campañas",
          schedules: "Programaciones",
          enabled: "Habilitadas",
          disabled: "Deshabilitadas",
          clear: "Cancelar",
          delete: "Eliminar",
          save: "Guardar",
          yes: "Sí",
          no: "No",
          money: "$",
        },
      },
      kanban: {
        toasts: {
          removed: "¡Etiqueta de Ticket Eliminada!",
          added: "¡Etiqueta de Ticket Agregada con Éxito!",
        },
        open: "Abierto",
        seeTicket: "Ver Ticket",
      },
      invoices: {
        title: "Facturas",
        paid: "Pagado",
        open: "Pendiente",
        expired: "Vencido",
        details: "Detalles",
        value: "Valor",
        dueDate: "Fecha Venc.",
        status: "Estado",
        action: "Acción",
        PAY: "PAGAR",
        PAID: "PAGADO",
      },
      checkoutPage: {
        steps: {
          data: "Datos",
          customize: "Personalizar",
          review: "Revisar",
        },
        success: "¡Suscripción realizada con éxito!, esperando la realización del pago",
        closeToEnd: "¡Falta poco!",
        BACK: "VOLVER",
        PAY: "PAGAR",
        NEXT: "SIGUIENTE",
        review: {
          title: "Resumen de la suscripción",
          details: "Detalles del plan",
          users: "Usuarios",
          whatsapp: "Whatsapp",
          charges: "Cobro: Mensual",
          total: "Total",
        },
        form: {
          firstName: {
            label: "Nombre completo*",
            required: "El nombre completo es obligatorio",
          },
          lastName: {
            label: "Apellido*",
            required: "El apellido es obligatorio",
          },
          address1: {
            label: "Dirección*",
            required: "La dirección es obligatoria",
          },
          city: {
            label: "Ciudad*",
            required: "La ciudad es obligatoria",
          },
          state: {
            label: "Estado/Provincia*",
            required: "El estado/provincia es obligatorio",
          },
          zipcode: {
            label: "Código Postal*",
            required: "El código postal es obligatorio",
            invalid: "Formato de código postal inválido",
          },
          country: {
            label: "País*",
            required: "El país es obligatorio",
          },
          useAddressForPaymentDetails: {
            label: "Usar esta dirección para los detalles de pago",
          },
          invoiceId: {
            label: "Usar este ID de factura",
          },
          nameOnCard: {
            label: "Nombre en la tarjeta*",
            required: "El nombre en la tarjeta es obligatorio",
          },
          cardNumber: {
            label: "Número de tarjeta*",
            required: "El número de tarjeta es obligatorio",
            invalid: "Número de tarjeta inválido (ej: 4111111111111)",
          },
          expiryDate: {
            label: "Fecha de vencimiento*",
            required: "La fecha de vencimiento es obligatoria",
            invalid: "Fecha de vencimiento inválida"
          },
          cvv: {
            label: "CVV*",
            required: "El CVV es obligatorio",
            invalid: "CVV inválido (ej: 123)",
          },
        },
        pricing: {
          users: "Usuarios",
          connection: "Conexión",
          queues: "Colas",
          SELECT: "SELECCIONAR",
          month: "mes",
        },
      },
      companies: {
        title: "Registrar Empresa",
        form: {
          name: "Nombre de la Empresa",
          plan: "Plan",
          token: "Token",
          submit: "Registrar",
          success: "¡Empresa creada con éxito!",
        },
      },
      auth: {
        toasts: {
          success: "¡Inicio de sesión realizado con éxito!",
        },
        token: "Token",
      },
      connections: {
        title: "Conexiones",
        toasts: {
          deleted: "¡Conexión con WhatsApp eliminada con éxito!",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Está seguro? Esta acción no puede ser revertida.",
          disconnectTitle: "Desconectar",
          disconnectMessage: "¿Está seguro? Necesitará leer el código QR nuevamente.",
        },
        buttons: {
          add: "Agregar WhatsApp",
          disconnect: "desconectar",
          tryAgain: "Intentar nuevamente",
          qrcode: "CÓDIGO QR",
          newQr: "Nuevo CÓDIGO QR",
          connecting: "Conectando",
        },
        toolTips: {
          disconnected: {
            title: "Error al iniciar sesión de WhatsApp",
            content: "Asegúrese de que su teléfono esté conectado a internet e intente nuevamente, o solicite un nuevo código QR",
          },
          qrcode: {
            title: "Esperando lectura del código QR",
            content: "Haga clic en el botón 'CÓDIGO QR' y lea el código QR con su teléfono para iniciar la sesión",
          },
          connected: {
            title: "¡Conexión establecida!",
          },
          timeout: {
            title: "Se perdió la conexión con el teléfono",
            content: "Asegúrese de que su teléfono esté conectado a internet y WhatsApp esté abierto, o haga clic en el botón 'Desconectar' para obtener un nuevo código QR",
          },
        },
        table: {
          name: "Nombre",
          status: "Estado",
          lastUpdate: "Última actualización",
          default: "Predeterminado",
          actions: "Acciones",
          session: "Sesión",
        },
      },
      whatsappModal: {
        title: {
          add: "Agregar WhatsApp",
          edit: "Editar WhatsApp",
        },
        formErrors: {
          name: {
            required: "El nombre es obligatorio",
            short: "Nombre demasiado corto",
            long: "Nombre demasiado largo",
          },
        },
        tabs: {
          general: "General",
          messages: "Mensajes",
          assessments: "Evaluaciones",
          integrations: "Integraciones",
          schedules: "Horario laboral",
        },
        form: {
          name: "Nombre",
          default: "Predeterminado",
          sendIdQueue: "Cola",
          timeSendQueue: "Redirigir a cola en X minutos",
          queueRedirection: "Redirección de Cola",
          outOfHoursMessage: "Mensaje fuera de horario",
          queueRedirectionDesc:
              "Seleccione una cola para redirigir los contactos que no tienen cola asignada",
          prompt: "Prompt",
          queue: "Cola de Transferencia",
          timeToTransfer: "Transferir después de x (minutos)",
          expiresTicket: "Cerrar chats abiertos después de x minutos",
          expiresInactiveMessage: "Mensaje de cierre por inactividad",
          greetingMessage: "Mensaje de bienvenida",
          complationMessage: "Mensaje de conclusión",
          integration: "Integración"
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "WhatsApp guardado con éxito.",
      },
      qrCodeModal: {
        title: "Utilice su WhatsApp:",
        steps: {
          one: "1 - Abra WhatsApp en su teléfono",
          two: {
            partOne: "2 - Toque en Más opciones en Android",
            partTwo: "o en Configuración",
            partThree: "en iPhone",
          },
          three:
              "3 - Toque en Dispositivos vinculados y luego en Vincular un dispositivo",
          four: "4 - Apunte su teléfono a esta pantalla para capturar el código QR",
        },
        waiting: "Esperando lectura del código QR",
      },
      qrCode: {
        message: "Lea el código QR para iniciar la sesión",
      },
      contacts: {
        title: "Contactos",
        toasts: {
          deleted: "¡Contacto eliminado con éxito!",
          deletedAll: "¡Todos los contactos eliminados con éxito!",
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "Eliminar ",
          deleteAllTitle: "Eliminar Todos",
          importTitle: "Importar contactos",
          deleteMessage:
              "¿Está seguro que desea eliminar este contacto? Todos los tickets relacionados se perderán.",
          deleteAllMessage:
              "¿Está seguro que desea eliminar todos los contactos? Todos los tickets relacionados se perderán.",
          importMessage: "¿Desea importar todos los contactos del teléfono?",
        },
        buttons: {
          import: "Importar Contactos",
          add: "Agregar Contacto",
          export: "Exportar Contactos",
          delete: "Eliminar Todos los Contactos",
        },
        table: {
          name: "Nombre",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "Acciones",
        },
      },
      contactImportModal: {
        title: "Planilla de contactos",
        labels: {
          import: "Importar contactos",
          result: "resultados",
          added: "Agregados",
          savedContact: "Contacto guardado",
          errors: "Errores",
        },
        buttons: {
          download: "Descargar planilla modelo",
          import: "Importar contactos",
        },
      },
      queueIntegrationModal: {
        title: {
          add: "Agregar proyecto",
          edit: "Editar proyecto",
        },
        form: {
          id: "ID",
          type: "Tipo",
          name: "Nombre",
          projectName: "Nombre del Proyecto",
          language: "Lenguaje",
          jsonContent: "JsonContent",
          urlN8N: "URL",
          typebotSlug: "Typebot - Slug",
          typebotExpires: "Tiempo en minutos para expirar una conversación",
          typebotKeywordFinish: "Palabra para finalizar el ticket",
          typebotKeywordRestart: "Palabra para reiniciar el flujo",
          typebotRestartMessage: "Mensaje al reiniciar la conversación",
          typebotUnknownMessage: "Mensaje de opción inválida",
          typebotDelayMessage: "Intervalo (ms) entre mensajes",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
          test: "Probar Bot",
        },
        messages: {
          testSuccess: "¡Integración probada con éxito!",
          addSuccess: "Integración agregada con éxito.",
          editSuccess: "Integración editada con éxito.",
        },
      },
      sideMenu: {
        name: "Menú Lateral Inicial",
        note: "Si está habilitado, el menú lateral iniciará cerrado",
        options: {
          enabled: "Abierto",
          disabled: "Cerrado",
        },
      },
      promptModal: {
        form: {
          name: "Nombre",
          prompt: "Prompt",
          model: "Modelo",
          max_tokens: "Máximo de Tokens en la respuesta",
          temperature: "Temperatura",
          apikey: "API Key",
          max_messages: "Máximo de mensajes en el Historial",
        },
        formErrors: {
          name: {
            short: "Nombre demasiado corto",
            long: "Nombre demasiado largo",
            required: "El nombre es obligatorio",
          },
          prompt: {
            short: "Prompt demasiado corto",
            required: "Describa el entrenamiento para la Inteligencia Artificial",
          },
          modal: {
            required: "Informe el modelo deseado para el Prompt",
          },
          maxTokens: {
            required: "Informe el número máximo de tokens en la respuesta",
          },
          temperature: {
            required: "Informe la temperatura",
          },
          apikey: {
            required: "Informe la API Key",
          },
          queueId: {
            required: "Informe la cola",
          },
          maxMessages: {
            required: "Informe el número máximo de mensajes en el historial",
          },
        },
        success: "¡Prompt guardado con éxito!",
        setor: "Informe el sector",
        title: {
          add: "Agregar Prompt",
          edit: "Editar Prompt",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
      },
      prompts: {
        title: "Prompts",
        table: {
          name: "Nombre",
          queue: "Sector/Cola",
          max_tokens: "Máximo Tokens Respuesta",
          actions: "Acciones",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Está seguro? ¡Esta acción no puede ser revertida!",
        },
        buttons: {
          add: "Agregar Prompt",
        },
      },
      contactModal: {
        title: {
          add: "Agregar contacto",
          edit: "Editar contacto",
        },
        form: {
          mainInfo: "Datos del contacto",
          extraInfo: "Información adicional",
          name: "Nombre",
          number: "Número de WhatsApp",
          email: "Email",
          extraName: "Nombre del campo",
          extraValue: "Valor",
          whatsapp: "Conexión Origen: ",
        },
        formErrors: {
          name: {
            required: "El nombre es obligatorio",
            short: "Nombre demasiado corto",
            long: "Nombre demasiado largo",
          },
          phone: {
            short: "Número demasiado corto",
            long: "Número demasiado largo",
          },
          email: {
            invalid: "Email inválido",
          },
        },
        buttons: {
          addExtraInfo: "Agregar información",
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Contacto guardado con éxito.",
      },
      queueModal: {
        title: {
          add: "Agregar cola",
          edit: "Editar cola",
        },
        form: {
          name: "Nombre",
          nameShort: "Nombre corto",
          nameLong: "Nombre largo",
          nameRequired: "El nombre es obligatorio",
          color: "Color",
          colorShort: "Color corto",
          colorLong: "Color largo",
          greetingMessage: "Mensaje de bienvenida",
          complationMessage: "Mensaje de conclusión",
          outOfHoursMessage: "Mensaje fuera de horario",
          ratingMessage: "Mensaje de evaluación",
          token: "Token",
          orderQueue: "Orden de la cola (Bot)",
          integrationId: "Integración",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        toasts: {
          success: "Cola guardada con éxito.",
          info: "Haga clic en guardar para registrar los cambios",
        },
        tabs: {
          queueData: "Datos de la cola",
          attendanceTime: "Horarios de Atención",
        },
      },
      userModal: {
        title: {
          add: "Agregar usuario",
          edit: "Editar usuario",
        },
        form: {
          name: "Nombre",
          email: "Email",
          password: "Contraseña",
          profile: "Perfil",
          whatsapp: "Conexión Predeterminada",
          allTicket: "Ticket Sin Cola [Invisible]",
          allTicketEnabled: "Habilitado",
          allTicketDesabled: "Deshabilitado",
        },
        formErrors: {
          name: {
            required: "El nombre es obligatorio",
            short: "Nombre demasiado corto",
            long: "Nombre demasiado largo",
          },
          password: {
            short: "Contraseña demasiado corta",
            long: "Contraseña demasiado larga",
          },
          email: {
            required: "El email es obligatorio",
            invalid: "Email inválido",
          },
        },
        labels: {
          liberations: "Liberaciones",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Usuario guardado con éxito.",
      },
      scheduleModal: {
        title: {
          add: "Nueva Programación",
          edit: "Editar Programación",
        },
        form: {
          body: "Mensaje",
          contact: "Contacto",
          sendAt: "Fecha de Programación",
          sentAt: "Fecha de Envío",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Programación guardada con éxito.",
      },
      tagModal: {
        title: {
          add: "Nueva Etiqueta",
          edit: "Editar Etiqueta",
        },
        form: {
          name: "Nombre",
          color: "Color",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Etiqueta guardada con éxito.",
      },
      chat: {
        toasts: {
          fillTitle: "Por favor, complete el título de la conversación.",
          fillUser: "Por favor, seleccione al menos un usuario.",
        },
        modal: {
          title: "Conversación",
          titleField: "Título",
        },
        confirm: {
          title: "Eliminar Conversación",
          message: "Esta acción no puede ser revertida, ¿confirmar?",
        },
        chats: "Chats",
        messages: "Mensajes",
        noTicketMessage: "Seleccione un ticket para comenzar a chatear.",
        buttons: {
          close: "Cerrar",
          save: "Guardar",
          new: "Nueva",
          newChat: "Nuevo",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "ARRASTRE Y SUELTE ARCHIVOS EN EL CAMPO DE ABAJO",
          titleFileList: "Lista de archivo(s)",
        },
      },
      ticketsManager: {
        buttons: {
          newTicket: "Nuevo",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Colas",
      },
      tickets: {
        toasts: {
          deleted: "La atención que estabas atendiendo fue eliminada.",
          unauthorized: "Acceso no permitido",
        },
        filters: {
          user: "Filtrar por usuarios",
          tags: "Filtrar por etiquetas",
        },
        notification: {
          message: "Mensaje de",
        },
        tabs: {
          open: { title: "Abiertos" },
          closed: { title: "Resueltos" },
          search: { title: "Búsqueda" },
        },
        search: {
          placeholder: "Buscar atención y mensajes",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Escriba para buscar usuarios",
        fieldQueueLabel: "Transferir a cola",
        fieldQueuePlaceholder: "Seleccione una cola",
        noOptions: "Ningún usuario encontrado con ese nombre",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "En espera",
        assignedHeader: "En atención",
        noTicketsTitle: "¡Nada aquí!",
        noTicketsMessage:
            "Ninguna atención encontrada con ese estado o término buscado",
        buttons: {
          accept: "Aceptar",
          closed: "Finalizar",
          reopen: "Reabrir",
        },
      },
      ticketsListItem: {
        tooltip: {
          chatbot: "Chatbot",
          peek: "Espiar Conversación",
        },
        noQueue: "SIN COLA",
      },
      ticketAdvanced: {
        selectTicket: "Seleccionar Ticket",
        ticketNav: "Ticket",
        attendanceNav: "Atenciones",
      },
      newTicketModal: {
        title: "Crear Ticket",
        fieldLabel: "Escriba para buscar el contacto",
        add: "Agregar",
        searchQueueError:
            "Ocurrió un error inesperado al intentar buscar las colas",
        selectQueue: "Seleccione una cola",
        selectConection: "Seleccione una conexión",
        buttons: {
          ok: "Guardar",
          cancel: "Cancelar",
        },
      },
      locationPreview: {
        button: "Visualizar",
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Conexiones",
          tickets: "Atenciones",
          quickMessages: "Respuestas Rápidas",
          tasks: "Tareas",
          contacts: "Contactos",
          queues: "Colas & Chatbot",
          tags: "Etiquetas",
          administration: "Administración",
          users: "Usuarios",
          settings: "Configuraciones",
          helps: "Ayuda",
          messagesAPI: "API",
          schedules: "Programaciones",
          campaigns: "Campañas",
          flows: "Flujos",
          annoucements: "Informativos",
          chats: "Chat Interno",
          financeiro: "Financiero",
          files: "Lista de archivos",
          prompts: "Open.AI",
          queueIntegration: "Integraciones",
        },
        appBar: {
          refresh: "Recargar página",
          notRegister: "Sin notificaciones",
          greeting: {
            hello: "Hola",
            welcome: "Bienvenido a",
            active: "Activo hasta",
          },
          user: {
            profile: "Perfil",
            logout: "Salir",
          },
        },
      },
      queueIntegration: {
        title: "Integraciones",
        table: {
          id: "ID",
          type: "Tipo",
          name: "Nombre",
          projectName: "Nombre del Proyecto",
          language: "Lenguaje",
          lastUpdate: "Última actualización",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar Proyecto",
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage:
              "¿Está seguro? ¡Esta acción no puede ser revertida! y será eliminada de las colas y conexiones vinculadas",
        },
      },
      files: {
        title: "Lista de archivos",
        table: {
          name: "Nombre",
          contacts: "Contactos",
          actions: "Acción",
        },
        toasts: {
          deleted: "¡Lista eliminada con éxito!",
          deletedAll: "¡Todas las listas fueron eliminadas con éxito!",
        },
        buttons: {
          add: "Agregar",
          deleteAll: "Eliminar Todos",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteAllTitle: "Eliminar Todos",
          deleteMessage: "¿Está seguro que desea eliminar esta lista?",
          deleteAllMessage: "¿Está seguro que desea eliminar todas las listas?",
        },
      },
      messagesAPI: {
        title: "API",
        labels: {
          doc: "Documentación para envío de mensajes",
          method: "Métodos de Envío",
          textMessage: "Mensaje de Texto",
          mediaMessage: "Mensaje Multimedia",
          instructions: "Instrucciones",
          observations: "Observaciones importantes",
          before1: "Antes de enviar mensajes, es necesario registrar el token vinculado a la conexión que enviará los mensajes.",
          before2: "Para realizar el registro acceda al menú 'Conexiones', haga clic en el botón editar de la conexión e inserte el token en el campo correspondiente.",
          numberDescription: "El número para envío no debe tener máscara o caracteres especiales y debe estar compuesto por:",
          countryCode: "Código del País",
          number: "Número",
          textMessage2: "1. Mensajes de Texto",
          textMessageInstructions: "A continuación la lista de información necesaria para enviar mensajes de texto:",
          method2: "Método",
          e: "y",
          tests: "Prueba de Envío",
          mediaMessage2: "2. Mensajes Multimedia",
        },
        textMessage: {
          number: "Número",
          body: "Mensaje",
          token: "Token registrado",
        },
        mediaMessage: {
          number: "Número",
          body: "Nombre del archivo",
          media: "Archivo",
          token: "Token registrado",
        },
        toasts: {
          unauthorized: "¡Esta empresa no tiene permiso para acceder a esta página! Le estamos redirigiendo.",
          success: "¡Mensaje enviado con éxito!",
        },
        buttons: {
          send: "Enviar",
        },
      },
      notifications: {
        noTickets: "Ninguna notificación.",
      },
      quickMessages: {
        title: "Respuestas Rápidas",
        searchPlaceholder: "Buscar...",
        noAttachment: "Sin adjunto",
        confirmationModal: {
          deleteTitle: "Eliminación",
          deleteMessage: "¡Esta acción es irreversible! ¿Desea continuar?",
        },
        buttons: {
          add: "Agregar",
          attach: "Adjuntar Archivo",
          cancel: "Cancelar",
          edit: "Editar",
        },
        toasts: {
          success: "¡Atajo agregado con éxito!",
          deleted: "¡Atajo eliminado con éxito!",
        },
        dialog: {
          title: "Mensaje Rápido",
          shortcode: "Atajo",
          message: "Respuesta",
          save: "Guardar",
          cancel: "Cancelar",
          geral: "Permitir editar",
          add: "Agregar",
          edit: "Editar",
          visao: "Permitir visión",
        },
        table: {
          shortcode: "Atajo",
          message: "Mensaje",
          actions: "Acciones",
          mediaName: "Nombre del Archivo",
          status: "Estado",
        },
      },
      messageVariablesPicker: {
        label: "Variables disponibles",
        vars: {
          contactFirstName: "Primer Nombre",
          contactName: "Nombre",
          greeting: "Saludo",
          protocolNumber: "Protocolo",
          date: "Fecha",
          hour: "Hora",
        },
      },
      contactLists: {
        title: "Listas de Contactos",
        table: {
          name: "Nombre",
          contacts: "Contactos",
          actions: "Acciones",
        },
        buttons: {
          add: "Nueva Lista",
        },
        dialog: {
          name: "Nombre",
          nameShort: "Nombre corto",
          nameLong: "Nombre largo",
          nameRequired: "El nombre es obligatorio",
          company: "Empresa",
          okEdit: "Editar",
          okAdd: "Agregar",
          add: "Agregar",
          edit: "Editar",
          cancel: "Cancelar",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Esta acción no puede ser revertida.",
        },
        toasts: {
          deleted: "Registro eliminado",
          success: "Operación realizada con éxito",
        },
      },
      campaigns: {
        title: "Campañas",
        searchPlaceholder: "Buscar",
        report: {
          title: "Informe de",
          title2: "Campaña",
          of: "de",
          validContacts: "Contactos válidos",
          delivered: "Entregados",
          connection: "Conexión",
          contactList: "Lista de Contactos",
          schedule: "Programación",
          conclusion: "Conclusión",
        },
        config: {
          interval: "Intervalos",
          randomInterval: "Intervalo Aleatorio de Envío",
          biggerInterval: "Intervalo Mayor Después de",
          greaterInterval: "Intervalo de Envío Mayor",
          noInterval: "Sin Intervalo",
          second: "segundo",
          seconds: "segundos",
          notDefined: "No definido",
          addVariable: "Agregar Variable",
          save: "Guardar Configuración",
          shortcut: "Atajo",
          content: "Contenido",
          close: "Cerrar",
          add: "Agregar",
        },
        buttons: {
          add: "Nueva Campaña",
          contactLists: "Listas de Contactos",
        },
        status: {
          inactive: "Inactiva",
          programmed: "Programada",
          inProgress: "En progreso",
          canceled: "Cancelada",
          finished: "Finalizada",
        },
        table: {
          name: "Nombre",
          whatsapp: "Conexión",
          contactList: "Lista de Contactos",
          status: "Estado",
          scheduledAt: "Programación",
          completedAt: "Completada",
          confirmation: "Confirmación",
          actions: "Acciones",
          notDefined: "No definida",
          notDefined2: "No definido",
          notScheduled: "Sin programación",
          notConcluded: "No concluida",
          stopCampaign: "Detener Campaña",
        },
        dialog: {
          new: "Nueva Campaña",
          update: "Editar Campaña",
          readonly: "Solo Lectura",
          form: {
            name: "Nombre",
            nameShort: "Nombre corto",
            nameLong: "Nombre largo",
            helper: "Utilice variables como {nombre}, {numero}, {email} o defina variables personalizadas.",
            nameRequired: "El nombre es obligatorio",
            message1: "Mensaje 1",
            message2: "Mensaje 2",
            message3: "Mensaje 3",
            message4: "Mensaje 4",
            message5: "Mensaje 5",
            messagePlaceholder: "Contenido del mensaje",
            whatsapp: "Conexión",
            status: "Estado",
            scheduledAt: "Programación",
            confirmation: "Confirmación",
            contactList: "Lista de Contactos",
            tagList: "Lista de Etiquetas",
            fileList: "Lista de Archivos",
          },
          buttons: {
            add: "Agregar",
            edit: "Actualizar",
            okadd: "Ok",
            cancel: "Cancelar Envíos",
            restart: "Reiniciar Envíos",
            close: "Cerrar",
            attach: "Adjuntar Archivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Esta acción no puede ser revertida.",
        },
        toasts: {
          configSaved: "Configuración guardada",
          success: "Operación realizada con éxito",
          cancel: "Campaña cancelada",
          restart: "Campaña reiniciada",
          deleted: "Registro eliminado",
        },
      },
      subscription: {
        title: "Suscripción",
        testPeriod: "Período de Prueba",
        remainingTest: "Su período de prueba termina en",
        remainingTest2: "días!",
        chargeEmail: "Email de facturación",
        signNow: "¡Suscribirse ahora!",
      },
      announcements: {
        active: "Activo",
        inactive: "Inactivo",
        title: "Informativos",
        searchPlaceholder: "Buscar",
        high: "Alta",
        medium: "Media",
        low: "Baja",
        buttons: {
          add: "Nuevo Informativo",
          contactLists: "Listas de Informativos",
        },
        table: {
          priority: "Prioridad",
          title: "Título",
          text: "Texto",
          mediaName: "Archivo",
          status: "Estado",
          actions: "Acciones",
        },
        dialog: {
          edit: "Edición de Informativo",
          add: "Nuevo Informativo",
          update: "Editar Informativo",
          readonly: "Solo Lectura",
          form: {
            priority: "Prioridad",
            required: "Campo obligatorio",
            title: "Título",
            text: "Texto",
            mediaPath: "Archivo",
            status: "Estado",
          },
          buttons: {
            add: "Agregar",
            edit: "Actualizar",
            okadd: "Ok",
            cancel: "Cancelar",
            close: "Cerrar",
            attach: "Adjuntar Archivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Esta acción no puede ser revertida.",
        },
        toasts: {
          success: "Operación realizada con éxito",
          deleted: "Registro eliminado",
          info: "¡Esta empresa no tiene permiso para acceder a esta página! Le estamos redirigiendo.",
        },
      },
      campaignsConfig: {
        title: "Configuración de Campañas",
      },
      queues: {
        title: "Colas & Chatbot",
        table: {
          id: "ID",
          name: "Nombre",
          color: "Color",
          greeting: "Mensaje de bienvenida",
          actions: "Acciones",
          orderQueue: "Ordenación de la cola (bot)",
        },
        buttons: {
          add: "Agregar cola",
        },
        toasts: {
          success: "Cola eliminada con éxito.",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Está seguro? ¡Esta acción no puede ser revertida! Las atenciones de esta cola seguirán existiendo, pero no tendrán ninguna cola asignada.",
        },
      },
      queueSelect: {
        inputLabel: "Colas",
      },
      users: {
        title: "Usuarios",
        table: {
          id: "ID",
          name: "Nombre",
          email: "Email",
          profile: "Perfil",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar usuario",
        },
        toasts: {
          deleted: "Usuario eliminado con éxito.",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Todos los datos del usuario se perderán. Las atenciones abiertas de este usuario serán movidas a la cola.",
        },
      },
      todolist: {
        input: "Nueva tarea",
        buttons: {
          add: "Agregar",
          save: "Guardar",
        },
      },
      helps: {
        title: "Centro de Ayuda",
      },
      schedules: {
        title: "Programaciones",
        confirmationModal: {
          deleteTitle: "¿Está seguro que desea eliminar esta Programación?",
          deleteMessage: "Esta acción no puede ser revertida.",
        },
        table: {
          contact: "Contacto",
          body: "Mensaje",
          sendAt: "Fecha de Programación",
          sentAt: "Fecha de Envío",
          status: "Estado",
          actions: "Acciones",
        },
        messages: {
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          allDay: "Todo el Día",
          week: "Semana",
          work_week: "Programaciones",
          day: "Día",
          month: "Mes",
          previous: "Anterior",
          next: "Siguiente",
          yesterday: "Ayer",
          tomorrow: "Mañana",
          today: "Hoy",
          agenda: "Agenda",
          noEventsInRange: "No hay programaciones en el período.",
          showMore: "más",
        },
        buttons: {
          add: "Nueva Programación",
        },
        toasts: {
          deleted: "Programación eliminada con éxito.",
        },
      },
      tags: {
        title: "Etiquetas",
        confirmationModal: {
          deleteTitle: "¿Está seguro que desea eliminar esta Etiqueta?",
          deleteMessage: "Esta acción no puede ser revertida.",
          deleteAllMessage: "¿Está seguro que desea eliminar todas las Etiquetas?",
          deleteAllTitle: "Eliminar Todas",
        },
        table: {
          name: "Nombre",
          color: "Color",
          tickets: "Registros Etiquetados",
          actions: "Acciones",
        },
        buttons: {
          add: "Nueva Etiqueta",
          deleteAll: "Eliminar Todas",
        },
        toasts: {
          deletedAll: "¡Todas las Etiquetas eliminadas con éxito!",
          deleted: "Etiqueta eliminada con éxito.",
        },
      },
      settings: {
        schedulesUpdated: "Horarios actualizados con éxito.",
        success: "Configuración guardada con éxito.",
        title: "Configuración",
        tabs: {
          options: "Opciones",
          schedules: "Horarios",
          companies: "Empresas",
          plans: "Planes",
          helps: "Ayuda",
        },
        options: {
          toasts: {
            success: "Operación actualizada con éxito.",
          },
          fields: {
            ratings: {
              title: "Evaluaciones",
              disabled: "Deshabilitadas",
              enabled: "Habilitadas",
            },
            expedientManager: {
              title: "Gestión de Horario Laboral",
              queue: "Cola",
              company: "Empresa",
            },
            ignoreMessages: {
              title: "Ignorar Mensajes de Grupos",
            },
            acceptCall: {
              title: "Aceptar Llamada",
              disabled: "No aceptar",
              enabled: "Aceptar",
            },
            chatbotType: {
              title: "Tipo Chatbot",
              text: "Texto",
            },
            sendGreetingAccepted: {
              title: "Enviar saludo al aceptar el ticket",
            },
            sendMsgTransfTicket: {
              title: "Enviar mensaje de transferencia de Cola/agente",
            },
            sendGreetingMessageOneQueues: {
              title: "Enviar saludo cuando haya solo 1 cola",
            },
            disabled: "Deshabilitado",
            active: "Activo",
            enabled: "Habilitado",
          },
          updating: "Actualizando...",
          tabs: {
            integrations: "INTEGRACIONES",
          },
        },
        helps: {
          toasts: {
            errorList: "No fue posible cargar la lista de registros",
            errorOperation: "No fue posible realizar la operación",
            error: "No fue posible realizar la operación. Verifique si ya existe una ayuda con el mismo nombre o si los campos fueron completados correctamente",
            success: "¡Operación realizada con éxito!",
          },
          buttons: {
            clean: "Limpiar",
            delete: "Eliminar",
            save: "Guardar",
          },
          grid: {
            title: "Título",
            description: "Descripción",
            video: "Video",
          },
          confirmModal: {
            title: "Eliminación de Registro",
            confirm: "¿Desea realmente eliminar este registro?",
          },
        },
        company: {
          toasts: {
            errorList: "No fue posible cargar la lista de registros",
            errorOperation: "No fue posible realizar la operación",
            error: "No fue posible realizar la operación. Verifique si ya existe una empresa con el mismo nombre o si los campos fueron completados correctamente",
            success: "¡Operación realizada con éxito!",
          },
          confirmModal: {
            title: "Eliminación de Registro",
            confirm: "¿Desea realmente eliminar este registro?",
          },
          form: {
            name: "Nombre",
            email: "Email",
            phone: "Teléfono",
            plan: "Plan",
            status: "Estado",
            yes: "Sí",
            no: "No",
            campanhas: "Campañas",
            enabled: "Habilitadas",
            disabled: "Deshabilitadas",
            dueDate: "Fecha de vencimiento",
            recurrence: "Recurrencia",
            monthly: "Mensual",
            expire: "Vencimiento",
            createdAt: "Creada En",
          },
          buttons: {
            clear: "Limpiar",
            delete: "Eliminar",
            expire: "+ Vencimiento",
            user: "Usuario",
            save: "Guardar",
          },
        },
        schedules: {
          form: {
            weekday: "Día de la Semana",
            initialHour: "Hora Inicial",
            finalHour: "Hora Final",
            save: "Guardar",
          },
        },
        settings: {
          userCreation: {
            name: "Creación de usuario",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Asignado a:",
          buttons: {
            return: "Regresar",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceptar",
            download: "Descargar",
          },
        },
        lostCall: "Llamada de voz/video perdida a las",
        deletedMessage: "Este mensaje fue borrado por el contacto",
        edited: "Editado",
        saudation: "¡Saluda a tu nuevo contacto!",
      },
      messagesInput: {
        placeholderOpen: "Escribe un mensaje",
        placeholderClosed: "Reabre o acepta este ticket para enviar un mensaje.",
        signMessage: "Firmar",
      },
      contactDrawer: {
        header: "Datos del contacto",
        buttons: {
          edit: "Editar contacto",
        },
        extraInfo: "Otra información",
      },
      fileModal: {
        title: {
          add: "Agregar lista de archivos",
          edit: "Editar lista de archivos",
        },
        buttons: {
          okAdd: "Guardar",
          okEdit: "Editar",
          cancel: "Cancelar",
          fileOptions: "Agregar archivo",
        },
        form: {
          name: "Nombre de la lista de archivos",
          message: "Detalles de la lista",
          fileOptions: "Lista de archivos",
          extraName: "Mensaje para enviar con archivo",
          extraValue: "Valor de la opción",
        },
        formErrors: {
          name: {
            required: "El nombre es obligatorio",
            short: "Nombre muy corto",
          },
          message: {
            required: "El mensaje es obligatorio",
          },
        },
        success: "¡Lista de archivos guardada con éxito!",
      },
      ticketOptionsMenu: {
        schedule: "Programación",
        delete: "Eliminar",
        transfer: "Transferir",
        registerAppointment: "Observaciones del Contacto",
        appointmentsModal: {
          title: "Observaciones del Contacto",
          textarea: "Observación",
          placeholder: "Ingrese aquí la información que desea registrar",
        },
        confirmationModal: {
          title: "Eliminar el ticket",
          titleFrom: "del contacto ",
          message: "¡Atención! Todos los mensajes relacionados al ticket se perderán.",
        },
        buttons: {
          delete: "Eliminar",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Eliminar",
        reply: "Responder",
        confirmationModal: {
          title: "¿Borrar mensaje?",
          message: "Esta acción no puede ser revertida.",
        },
      },
      backendErrors: {
        ERR_INTERNAL_SERVER_ERROR: "Ocurrió un error inesperado. Por favor, intente nuevamente más tarde",
        ERR_NO_OTHER_WHATSAPP: "Debe haber al menos un WhatsApp predeterminado.",
        ERR_NO_DEF_WAPP_FOUND: "No se encontró WhatsApp predeterminado. Verifique la página de conexiones.",
        ERR_WAPP_NOT_INITIALIZED: "Esta sesión de WhatsApp no fue inicializada. Verifique la página de conexiones.",
        ERR_WAPP_CHECK_CONTACT: "No fue posible verificar el contacto de WhatsApp. Verifique la página de conexiones",
        ERR_WAPP_INVALID_CONTACT: "Este no es un número de WhatsApp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA: "No fue posible descargar el archivo multimedia de WhatsApp. Verifique la página de conexiones.",
        ERR_INVALID_CREDENTIALS: "Error de autenticación. Por favor, intente nuevamente.",
        ERR_USER_DONT_EXISTS: "Usuario no encontrado. Verifique el email proporcionado.",
        ERR_SENDING_WAPP_MSG: "Error al enviar mensaje de WhatsApp. Verifique la página de conexiones.",
        ERR_DELETE_WAPP_MSG: "No fue posible eliminar el mensaje de WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Ya existe un ticket abierto para este contacto.",
        ERR_SESSION_EXPIRED: "Sesión expirada. Por favor inicie sesión.",
        ERR_USER_CREATION_DISABLED: "La creación de usuarios fue deshabilitada por el administrador.",
        ERR_NO_PERMISSION: "No tiene permiso para acceder a este recurso.",
        ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este número.",
        ERR_NO_SETTING_FOUND: "No se encontró ninguna configuración con este ID.",
        ERR_NO_CONTACT_FOUND: "No se encontró ningún contacto con este ID.",
        ERR_NO_TICKET_FOUND: "No se encontró ningún ticket con este ID.",
        ERR_NO_USER_FOUND: "No se encontró ningún usuario con este ID.",
        ERR_NO_WAPP_FOUND: "No se encontró ningún WhatsApp con este ID.",
        ERR_CREATING_MESSAGE: "Error al crear mensaje en la base de datos.",
        ERR_CREATING_TICKET: "Error al crear ticket en la base de datos.",
        ERR_FETCH_WAPP_MSG: "Error al buscar el mensaje en WhatsApp, tal vez sea muy antiguo.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS: "Este color ya está en uso, elija otro.",
        ERR_WAPP_GREETING_REQUIRED: "El mensaje de saludo es obligatorio cuando hay más de una cola.",
      },
    }
  }
};

export { messages };