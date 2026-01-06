const messages = {
	en: {
		translations: {
			selectLanguage: "Select Language",
			signup: {
				title: "Sign Up",
				toasts: {
					success: "User created successfully! Please login!!!",
					fail: "Error creating user. Please check the provided information.",
				},
				form: {
					name: "Company Name",
					email: "Email",
					phone: "Phone Number (with Area Code)",
					plan: "Plan",
					password: "Password",
				},
				formErrors: {
					name: {
						required: "Company name is required",
						short: "Name is too short",
						long: "Name is too long",
					},
					password: {
						short: "Password is too short",
						long: "Password is too long",
					},
					email: {
						required: "Email is required",
						invalid: "Invalid email",
					},
				},
				buttons: {
					submit: "Register",
					login: "Already have an account? Login!",
				},
				plan: {
					attendant: "Attendant",
					whatsapp: "WhatsApp",
					queues: "Queues",
				},
			},
			login: {
				title: "Login",
				form: {
					email: "Email",
					password: "Password",
				},
				buttons: {
					submit: "Login",
					register: "Sign up now!",
				},
			},
			resetPassword: {
				title: "Reset Password",
				toasts: {
					emailSent: "Email sent successfully!",
					emailNotFound: "Email not found!",
					passwordUpdated: "Password updated successfully!",
				},
				formErrors: {
					email: {
						required: "Email is required",
						invalid: "Invalid email",
					},
					newPassword: {
						required: "New password is required",
						matches: "Your password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number.",
					},
					confirmPassword: {
						required: "Password confirmation is required",
						matches: "Passwords do not match",
					},
				},
				form: {
					email: "Email",
					verificationCode: "Verification Code",
					newPassword: "New Password",
					confirmPassword: "Confirm New Password",
				},
				buttons: {
					submitEmail: "Send Email",
					submitPassword: "Reset Password",
					back: "Don't have an account? Sign up!",
				},
			},
			dashboard: {
				toasts: {
					selectFilterError: "Set filter parameters",
					userChartError: "Error getting conversation information",
					dateChartError: "Error getting conversation information",
				},
				filters: {
					initialDate: "Start Date",
					finalDate: "End Date",
					filterType: {
						title: "Filter Type",
						options: {
							perDate: "Filter by Date",
							perPeriod: "Filter by Period",
						},
						helper: "Select desired filter type",
					},
				},
				periodSelect: {
					title: "Period",
					options: {
						none: "None selected",
						last3: "Last 3 days",
						last7: "Last 7 days",
						last15: "Last 15 days",
						last30: "Last 30 days",
						last60: "Last 60 days",
						last90: "Last 90 days",
					},
					helper: "Select desired period",
				},
				counters: {
					inTalk: "In conversation",
					waiting: "Waiting",
					finished: "Finished",
					newContacts: "New contacts",
					averageTalkTime: "Avg. Talk Time",
					averageWaitTime: "Avg. Wait Time",
				},
				buttons: {
					filter: "Filter",
				},
				onlineTable: {
					ratingLabel: "1 - Unsatisfied, 2 - Satisfied, 3 - Very Satisfied",
					name: "Name",
					ratings: "Ratings",
					avgSupportTime: "Avg. Support Time",
					status: "Status (Current)",
				},
				charts: {
					user: {
						label: "Conversations Chart",
						title: "Total Conversations by Users",
						start: "Start",
						end: "End",
						filter: "Filter",
					},
					date: {
						label: "Conversations Chart",
						title: "Total",
						start: "Start",
						end: "End",
						filter: "Filter",
					},
				},
			},
			plans: {
				toasts: {
					errorList: "Could not load records list",
					errorOperation: "Could not complete operation",
					error: "Could not complete operation. Check if a plan with the same name already exists or if fields were filled correctly",
					success: "Operation completed successfully!",
				},
				confirm: {
					title: "Delete Record",
					message: "Do you really want to delete this record?",
				},
				form: {
					name: "Name",
					users: "Users",
					connections: "Connections",
					queues: "Queues",
					value: "Value",
					internalChat: "Internal Chat",
					externalApi: "External API",
					kanban: "Kanban",
					integrations: "Integrations",
					campaigns: "Campaigns",
					schedules: "Schedules",
					enabled: "Enabled",
					disabled: "Disabled",
					clear: "Cancel",
					delete: "Delete",
					save: "Save",
					yes: "Yes",
					no: "No",
					money: "$",
				},
			},
			kanban: {
				toasts: {
					removed: "Ticket Tag Removed!",
					added: "Ticket Tag Added Successfully!",
				},
				open: "Open",
				seeTicket: "View Ticket",
			},
			invoices: {
				title: "Invoices",
				paid: "Paid",
				open: "Open",
				expired: "Expired",
				details: "Details",
				value: "Amount",
				dueDate: "Due Date",
				status: "Status",
				action: "Action",
				PAY: "PAY",
				PAID: "PAID",
			},
			checkoutPage: {
				steps: {
					data: "Data",
					customize: "Customize",
					review: "Review",
				},
				success: "Subscription completed successfully! Awaiting payment confirmation",
				closeToEnd: "Almost there!",
				BACK: "BACK",
				PAY: "PAY",
				NEXT: "NEXT",
				review: {
					title: "Subscription Summary",
					details: "Plan Details",
					users: "Users",
					whatsapp: "WhatsApp",
					charges: "Billing: Monthly",
					total: "Total",
				},
				form: {
					firstName: {
						label: "Full Name*",
						required: "Full name is required",
					},
					lastName: {
						label: "Last Name*",
						required: "Last name is required",
					},
					address1: {
						label: "Address*",
						required: "Address is required",
					},
					city: {
						label: "City*",
						required: "City is required",
					},
					state: {
						label: "State*",
						required: "State is required",
					},
					zipcode: {
						label: "ZIP Code*",
						required: "ZIP code is required",
						invalid: "Invalid ZIP code format",
					},
					country: {
						label: "Country*",
						required: "Country is required",
					},
					useAddressForPaymentDetails: {
						label: "Use this address for payment details",
					},
					invoiceId: {
						label: "Use this invoice ID",
					},
					nameOnCard: {
						label: "Name on Card*",
						required: "Name on card is required",
					},
					cardNumber: {
						label: "Card Number*",
						required: "Card number is required",
						invalid: "Invalid card number (ex: 4111111111111)",
					},
					expiryDate: {
						label: "Expiration Date*",
						required: "Expiration date is required",
						invalid: "Invalid expiration date"
					},
					cvv: {
						label: "CVV*",
						required: "CVV is required",
						invalid: "Invalid CVV (ex: 123)",
					},
				},
				pricing: {
					users: "Users",
					connection: "Connection",
					queues: "Queues",
					SELECT: "SELECT",
					month: "month",
				},
			},
			companies: {
				title: "Register Company",
				form: {
					name: "Company Name",
					plan: "Plan",
					token: "Token",
					submit: "Register",
					success: "Company created successfully!",
				},
			},
			auth: {
				toasts: {
					success: "Login successful!",
				},
				token: "Token",
			},
			connections: {
				title: "Connections",
				toasts: {
					deleted: "WhatsApp connection deleted successfully!",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "Are you sure? This action cannot be undone.",
					disconnectTitle: "Disconnect",
					disconnectMessage: "Are you sure? You'll need to scan the QR Code again.",
				},
				buttons: {
					add: "Add WhatsApp",
					disconnect: "disconnect",
					tryAgain: "Try again",
					qrcode: "QR CODE",
					newQr: "New QR CODE",
					connecting: "Connecting",
				},
				toolTips: {
					disconnected: {
						title: "Failed to start WhatsApp session",
						content: "Make sure your phone is connected to the internet and try again, or request a new QR Code",
					},
					qrcode: {
						title: "Waiting for QR Code scan",
						content: "Click the 'QR CODE' button and scan the QR Code with your phone to start the session",
					},
					connected: {
						title: "Connection established!",
					},
					timeout: {
						title: "Connection to phone was lost",
						content: "Make sure your phone is connected to the internet and WhatsApp is open, or click the 'Disconnect' button to get a new QR Code",
					},
				},
				table: {
					name: "Name",
					status: "Status",
					lastUpdate: "Last update",
					default: "Default",
					actions: "Actions",
					session: "Session",
				},
			},
			whatsappModal: {
				title: {
					add: "Add WhatsApp",
					edit: "Edit WhatsApp",
				},
				formErrors: {
					name: {
						required: "Name is required",
						short: "Name is too short",
						long: "Name is too long",
					},
				},
				tabs: {
					general: "General",
					messages: "Messages",
					assessments: "Assessments",
					integrations: "Integrations",
					schedules: "Business Hours",
				},
				form: {
					name: "Name",
					default: "Default",
					sendIdQueue: "Queue",
					timeSendQueue: "Redirect to queue in X minutes",
					queueRedirection: "Queue Redirection",
					outOfHoursMessage: "Out of office message",
					queueRedirectionDesc: "Select a queue for contacts without a queue to be redirected to",
					prompt: "Prompt",
					queue: "Transfer Queue",
					timeToTransfer: "Transfer after x (minutes)",
					expiresTicket: "Close open chats after x minutes",
					expiresInactiveMessage: "Inactivity closure message",
					greetingMessage: "Greeting message",
					complationMessage: "Completion message",
					integration: "Integration"
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "WhatsApp saved successfully.",
			},
			qrCodeModal: {
				title: "Use your WhatsApp:",
				steps: {
					one: "1 - Open WhatsApp on your phone",
					two: {
						partOne: "2 - Tap More options on Android",
						partTwo: "or Settings",
						partThree: "on iPhone",
					},
					three: "3 - Tap Linked Devices and then Link a Device",
					four: "4 - Point your phone at this screen to capture the QR Code",
				},
				waiting: "Waiting for QR Code scan",
			},
			qrCode: {
				message: "Scan the QR Code to start the session",
			},
			contacts: {
				title: "Contacts",
				toasts: {
					deleted: "Contact deleted successfully!",
					deletedAll: "All contacts deleted successfully!",
				},
				searchPlaceholder: "Search...",
				confirmationModal: {
					deleteTitle: "Delete ",
					deleteAllTitle: "Delete All",
					importTitle: "Import contacts",
					deleteMessage: "Are you sure you want to delete this contact? All related tickets will be lost.",
					deleteAllMessage: "Are you sure you want to delete all contacts? All related tickets will be lost.",
					importMessage: "Do you want to import all phone contacts?",
				},
				buttons: {
					import: "Import Contacts",
					add: "Add Contact",
					export: "Export Contacts",
					delete: "Delete All Contacts",
				},
				table: {
					name: "Name",
					whatsapp: "WhatsApp",
					email: "Email",
					actions: "Actions",
				},
			},
			contactImportModal: {
				title: "Contact Spreadsheet",
				labels: {
					import: "Import contacts",
					result: "results",
					added: "Added",
					savedContact: "Contact saved",
					errors: "Errors",
				},
				buttons: {
					download: "Download template spreadsheet",
					import: "Import contacts",
				},
			},
			queueIntegrationModal: {
				title: {
					add: "Add project",
					edit: "Edit project",
				},
				form: {
					id: "ID",
					type: "Type",
					name: "Name",
					projectName: "Project Name",
					language: "Language",
					jsonContent: "JsonContent",
					urlN8N: "URL",
					typebotSlug: "Typebot - Slug",
					typebotExpires: "Time in minutes to expire a conversation",
					typebotKeywordFinish: "Keyword to finish ticket",
					typebotKeywordRestart: "Keyword to restart flow",
					typebotRestartMessage: "Message when restarting conversation",
					typebotUnknownMessage: "Invalid option message",
					typebotDelayMessage: "Interval (ms) between messages",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
					test: "Test Bot",
				},
				messages: {
					testSuccess: "Integration tested successfully!",
					addSuccess: "Integration added successfully.",
					editSuccess: "Integration edited successfully.",
				},
			},
			sideMenu: {
				name: "Initial Side Menu",
				note: "If enabled, the side menu will start closed",
				options: {
					enabled: "Open",
					disabled: "Closed",
				},
			},
			promptModal: {
				form: {
					name: "Name",
					prompt: "Prompt",
					model: "Model",
					max_tokens: "Maximum Tokens in response",
					temperature: "Temperature",
					apikey: "API Key",
					max_messages: "Maximum messages in History",
				},
				formErrors: {
					name: {
						short: "Name is too short",
						long: "Name is too long",
						required: "Name is required",
					},
					prompt: {
						short: "Prompt is too short",
						required: "Describe the training for Artificial Intelligence",
					},
					modal: {
						required: "Enter the desired model for the Prompt",
					},
					maxTokens: {
						required: "Enter the maximum number of tokens in the response",
					},
					temperature: {
						required: "Enter the temperature",
					},
					apikey: {
						required: "Enter the API Key",
					},
					queueId: {
						required: "Enter the queue",
					},
					maxMessages: {
						required: "Enter the maximum number of messages in history",
					},
				},
				success: "Prompt saved successfully!",
				setor: "Enter the sector",
				title: {
					add: "Add Prompt",
					edit: "Edit Prompt",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
			},
			prompts: {
				title: "Prompts",
				table: {
					name: "Name",
					queue: "Sector/Queue",
					max_tokens: "Maximum Response Tokens",
					actions: "Actions",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "Are you sure? This action cannot be undone!",
				},
				buttons: {
					add: "Add Prompt",
				},
			},
			contactModal: {
				title: {
					add: "Add Contact",
					edit: "Edit Contact",
				},
				form: {
					mainInfo: "Contact Information",
					extraInfo: "Additional Information",
					name: "Name",
					number: "WhatsApp Number",
					email: "Email",
					extraName: "Field Name",
					extraValue: "Value",
					whatsapp: "Source Connection: ",
				},
				formErrors: {
					name: {
						required: "Name is required",
						short: "Name is too short",
						long: "Name is too long",
					},
					phone: {
						short: "Number is too short",
						long: "Number is too long",
					},
					email: {
						invalid: "Invalid email",
					},
				},
				buttons: {
					addExtraInfo: "Add Information",
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "Contact saved successfully.",
			},
			queueModal: {
				title: {
					add: "Add Queue",
					edit: "Edit Queue",
				},
				form: {
					name: "Name",
					nameShort: "Short name",
					nameLong: "Long name",
					nameRequired: "Name is required",
					color: "Color",
					colorShort: "Short color",
					colorLong: "Long color",
					greetingMessage: "Greeting message",
					complationMessage: "Completion message",
					outOfHoursMessage: "Out of office message",
					ratingMessage: "Rating message",
					token: "Token",
					orderQueue: "Queue order (Bot)",
					integrationId: "Integration",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				toasts: {
					success: "Queue saved successfully.",
					info: "Click save to register changes",
				},
				tabs: {
					queueData: "Queue Data",
					attendanceTime: "Service Hours",
				},
			},
			userModal: {
				title: {
					add: "Add User",
					edit: "Edit User",
				},
				form: {
					name: "Name",
					email: "Email",
					password: "Password",
					profile: "Profile",
					whatsapp: "Default Connection",
					allTicket: "Queueless Ticket [Invisible]",
					allTicketEnabled: "Enabled",
					allTicketDesabled: "Disabled",
				},
				formErrors: {
					name: {
						required: "Name is required",
						short: "Name is too short",
						long: "Name is too long",
					},
					password: {
						short: "Password is too short",
						long: "Password is too long",
					},
					email: {
						required: "Email is required",
						invalid: "Invalid email",
					},
				},
				labels: {
					liberations: "Releases",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "User saved successfully.",
			},
			scheduleModal: {
				title: {
					add: "New Schedule",
					edit: "Edit Schedule",
				},
				form: {
					body: "Message",
					contact: "Contact",
					sendAt: "Schedule Date",
					sentAt: "Send Date",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "Schedule saved successfully.",
			},
			tagModal: {
				title: {
					add: "New Tag",
					edit: "Edit Tag",
				},
				form: {
					name: "Name",
					color: "Color",
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "Tag saved successfully.",
			},
			chat: {
				toasts: {
					fillTitle: "Please fill in the conversation title.",
					fillUser: "Please select at least one user.",
				},
				modal: {
					title: "Conversation",
					titleField: "Title",
				},
				confirm: {
					title: "Delete Conversation",
					message: "This action cannot be undone, confirm?",
				},
				chats: "Chats",
				messages: "Messages",
				noTicketMessage: "Select a ticket to start chatting.",
				buttons: {
					close: "Close",
					save: "Save",
					new: "New",
					newChat: "New",
				},
			},
			uploads: {
				titles: {
					titleUploadMsgDragDrop: "DRAG AND DROP FILES IN THE FIELD BELOW",
					titleFileList: "File List",
				},
			},
			ticketsManager: {
				buttons: {
					newTicket: "New",
				},
			},
			ticketsQueueSelect: {
				placeholder: "Queues",
			},
			tickets: {
				toasts: {
					deleted: "The service you were in has been deleted.",
					unauthorized: "Access not allowed",
				},
				filters: {
					user: "Filter by users",
					tags: "Filter by tags",
				},
				notification: {
					message: "Message from",
				},
				tabs: {
					open: { title: "Open" },
					closed: { title: "Resolved" },
					search: { title: "Search" },
				},
				search: {
					placeholder: "Search tickets and messages",
				},
				buttons: {
					showAll: "All",
				},
			},
			transferTicketModal: {
				title: "Transfer Ticket",
				fieldLabel: "Type to search users",
				fieldQueueLabel: "Transfer to queue",
				fieldQueuePlaceholder: "Select a queue",
				noOptions: "No user found with that name",
				buttons: {
					ok: "Transfer",
					cancel: "Cancel",
				},
			},
			ticketsList: {
				pendingHeader: "Waiting",
				assignedHeader: "In Progress",
				noTicketsTitle: "Nothing here!",
				noTicketsMessage: "No service found with this status or search term",
				buttons: {
					accept: "Accept",
					closed: "Finish",
					reopen: "Reopen",
				},
			},
			ticketsListItem: {
				tooltip: {
					chatbot: "Chatbot",
					peek: "Peek Conversation",
				},
				noQueue: "NO QUEUE",
			},
			ticketAdvanced: {
				selectTicket: "Select Ticket",
				ticketNav: "Ticket",
				attendanceNav: "Services",
			},
			newTicketModal: {
				title: "Create Ticket",
				fieldLabel: "Type to search contact",
				add: "Add",
				searchQueueError: "An unexpected error occurred while trying to fetch queues",
				selectQueue: "Select a queue",
				selectConection: "Select a connection",
				buttons: {
					ok: "Save",
					cancel: "Cancel",
				},
			},
			locationPreview: {
				button: "Preview",
			},
			mainDrawer: {
				listItems: {
					dashboard: "Dashboard",
					connections: "Connections",
					tickets: "Services",
					quickMessages: "Quick Responses",
					tasks: "Tasks",
					contacts: "Contacts",
					queues: "Queues & Chatbot",
					tags: "Tags",
					administration: "Administration",
					users: "Users",
					settings: "Settings",
					helps: "Help",
					messagesAPI: "API",
					schedules: "Schedules",
					campaigns: "Campaigns",
					flows: "Flows",
					annoucements: "Announcements",
					chats: "Internal Chat",
					financeiro: "Financial",
					files: "File List",
					prompts: "Open.AI",
					queueIntegration: "Integrations",
				},
				appBar: {
					refresh: "Reload page",
					notRegister: "No notifications",
					greeting: {
						hello: "Hello",
						welcome: "Welcome to",
						active: "Active until",
					},
					user: {
						profile: "Profile",
						logout: "Logout",
					},
				},
			},
			queueIntegration: {
				title: "Integrations",
				table: {
					id: "ID",
					type: "Type",
					name: "Name",
					projectName: "Project Name",
					language: "Language",
					lastUpdate: "Last update",
					actions: "Actions",
				},
				buttons: {
					add: "Add Project",
				},
				searchPlaceholder: "Search...",
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "Are you sure? This action cannot be undone! It will be removed from linked queues and connections",
				},
			},
			files: {
				title: "File List",
				table: {
					name: "Name",
					contacts: "Contacts",
					actions: "Action",
				},
				toasts: {
					deleted: "List deleted successfully!",
					deletedAll: "All lists deleted successfully!",
				},
				buttons: {
					add: "Add",
					deleteAll: "Delete All",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteAllTitle: "Delete All",
					deleteMessage: "Are you sure you want to delete this list?",
					deleteAllMessage: "Are you sure you want to delete all lists?",
				},
			},
			messagesAPI: {
				title: "API",
				labels: {
					doc: "Documentation for sending messages",
					method: "Sending Methods",
					textMessage: "Text Message",
					mediaMessage: "Media Message",
					instructions: "Instructions",
					observations: "Important notes",
					before1: "Before sending messages, you need to register the token linked to the connection that will send the messages.",
					before2: "To register, access the 'Connections' menu, click the edit button of the connection and enter the token in the appropriate field.",
					numberDescription: "The sending number should not have masks or special characters and must be composed of:",
					countryCode: "Country Code",
					number: "Number",
					textMessage2: "1. Text Messages",
					textMessageInstructions: "Below is the list of information needed to send text messages:",
					method2: "Method",
					e: "and",
					tests: "Send Test",
					mediaMessage2: "2. Media Messages",
				},
				textMessage: {
					number: "Number",
					body: "Message",
					token: "Registered Token",
				},
				mediaMessage: {
					number: "Number",
					body: "File name",
					media: "File",
					token: "Registered Token",
				},
				toasts: {
					unauthorized: "This company doesn't have permission to access this page! We are redirecting you.",
					success: "Message sent successfully!",
				},
				buttons: {
					send: "Send",
				},
			},
			notifications: {
				noTickets: "No notifications.",
			},
			quickMessages: {
				title: "Quick Responses",
				searchPlaceholder: "Search...",
				noAttachment: "No attachment",
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "This action is irreversible! Do you want to proceed?",
				},
				buttons: {
					add: "Add",
					attach: "Attach File",
					cancel: "Cancel",
					edit: "Edit",
				},
				toasts: {
					success: "Shortcut added successfully!",
					deleted: "Shortcut removed successfully!",
				},
				dialog: {
					title: "Quick Message",
					shortcode: "Shortcut",
					message: "Response",
					save: "Save",
					cancel: "Cancel",
					geral: "Allow edit",
					add: "Add",
					edit: "Edit",
					visao: "Allow view",
				},
				table: {
					shortcode: "Shortcut",
					message: "Message",
					actions: "Actions",
					mediaName: "File Name",
					status: "Status",
				},
			},
			messageVariablesPicker: {
				label: "Available Variables",
				vars: {
					contactFirstName: "First Name",
					contactName: "Name",
					greeting: "Greeting",
					protocolNumber: "Protocol",
					date: "Date",
					hour: "Hour",
				},
			},
			contactLists: {
				title: "Contact Lists",
				table: {
					name: "Name",
					contacts: "Contacts",
					actions: "Actions",
				},
				buttons: {
					add: "New List",
				},
				dialog: {
					name: "Name",
					nameShort: "Short name",
					nameLong: "Long name",
					nameRequired: "Name is required",
					company: "Company",
					okEdit: "Edit",
					okAdd: "Add",
					add: "Add",
					edit: "Edit",
					cancel: "Cancel",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "This action cannot be undone.",
				},
				toasts: {
					deleted: "Record deleted",
					success: "Operation completed successfully",
				},
			},
			contactListItems: {
				title: "Contacts",
				searchPlaceholder: "Search",
				buttons: {
					add: "New",
					lists: "Lists",
					import: "Import",
				},
				download: "Click here to download example spreadsheet.",
				dialog: {
					name: "Name",
					nameShort: "Short name",
					nameLong: "Long name",
					nameRequired: "Name is required",
					number: "Number",
					numberShort: "Short number",
					numberLong: "Long number",
					whatsapp: "WhatsApp",
					email: "Email",
					emailInvalid: "Invalid email",
					okEdit: "Edit",
					okAdd: "Add",
					add: "Add",
					edit: "Edit",
					cancel: "Cancel",
				},
				table: {
					name: "Name",
					number: "Number",
					whatsapp: "WhatsApp",
					email: "Email",
					actions: "Actions",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "This action cannot be undone.",
					importMessage: "Do you want to import contacts from this spreadsheet? ",
					importTitle: "Import",
				},
				toasts: {
					deleted: "Record deleted",
				},
			},
			campaigns: {
				title: "Campaigns",
				searchPlaceholder: "Search",
				report: {
					title: "Report of",
					title2: "Campaign",
					of: "of",
					validContacts: "Valid contacts",
					delivered: "Delivered",
					connection: "Connection",
					contactList: "Contact List",
					schedule: "Schedule",
					conclusion: "Conclusion",
				},
				config: {
					interval: "Intervals",
					randomInterval: "Random Send Interval",
					biggerInterval: "Larger Interval After",
					greaterInterval: "Greater Send Interval",
					noInterval: "No Interval",
					second: "second",
					seconds: "seconds",
					notDefined: "Not defined",
					addVariable: "Add Variable",
					save: "Save Settings",
					shortcut: "Shortcut",
					content: "Content",
					close: "Close",
					add: "Add",
				},
				buttons: {
					add: "New Campaign",
					contactLists: "Contact Lists",
				},
				status: {
					inactive: "Inactive",
					programmed: "Scheduled",
					inProgress: "In progress",
					canceled: "Canceled",
					finished: "Finished",
				},
				table: {
					name: "Name",
					whatsapp: "Connection",
					contactList: "Contact List",
					status: "Status",
					scheduledAt: "Schedule",
					completedAt: "Completed",
					confirmation: "Confirmation",
					actions: "Actions",
					notDefined: "Not defined",
					notDefined2: "Not defined",
					notScheduled: "Not scheduled",
					notConcluded: "Not concluded",
					stopCampaign: "Stop Campaign",
				},
				dialog: {
					new: "New Campaign",
					update: "Edit Campaign",
					readonly: "View Only",
					form: {
						name: "Name",
						nameShort: "Short name",
						nameLong: "Long name",
						helper: "Use variables like {name}, {number}, {email} or define custom variables.",
						nameRequired: "Name is required",
						message1: "Message 1",
						message2: "Message 2",
						message3: "Message 3",
						message4: "Message 4",
						message5: "Message 5",
						messagePlaceholder: "Message content",
						whatsapp: "Connection",
						status: "Status",
						scheduledAt: "Schedule",
						confirmation: "Confirmation",
						contactList: "Contact List",
						tagList: "Tag List",
						fileList: "File List",
					},
					buttons: {
						add: "Add",
						edit: "Update",
						okadd: "Ok",
						cancel: "Cancel Sends",
						restart: "Restart Sends",
						close: "Close",
						attach: "Attach File",
					},
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "This action cannot be undone.",
				},
				toasts: {
					configSaved: "Settings saved",
					success: "Operation completed successfully",
					cancel: "Campaign canceled",
					restart: "Campaign restarted",
					deleted: "Record deleted",
				},
			},
			subscription: {
				title: "Subscription",
				testPeriod: "Trial Period",
				remainingTest: "Your trial period ends in",
				remainingTest2: "days!",
				chargeEmail: "Billing email",
				signNow: "Sign up now!",
			},
			announcements: {
				active: "Active",
				inactive: "Inactive",
				title: "Announcements",
				searchPlaceholder: "Search",
				high: "High",
				medium: "Medium",
				low: "Low",
				buttons: {
					add: "New Announcement",
					contactLists: "Announcement Lists",
				},
				table: {
					priority: "Priority",
					title: "Title",
					text: "Text",
					mediaName: "File",
					status: "Status",
					actions: "Actions",
				},
				dialog: {
					edit: "Edit Announcement",
					add: "New Announcement",
					update: "Edit Announcement",
					readonly: "View Only",
					form: {
						priority: "Priority",
						required: "Required field",
						title: "Title",
						text: "Text",
						mediaPath: "File",
						status: "Status",
					},
					buttons: {
						add: "Add",
						edit: "Update",
						okadd: "Ok",
						cancel: "Cancel",
						close: "Close",
						attach: "Attach File",
					},
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "This action cannot be undone.",
				},
				toasts: {
					success: "Operation completed successfully",
					deleted: "Record deleted",
					info: "This company doesn't have permission to access this page! We are redirecting you.",
				},
			},
			campaignsConfig: {
				title: "Campaign Settings",
			},
			queues: {
				title: "Queues & Chatbot",
				table: {
					id: "ID",
					name: "Name",
					color: "Color",
					greeting: "Greeting message",
					actions: "Actions",
					orderQueue: "Queue order (bot)",
				},
				buttons: {
					add: "Add queue",
				},
				toasts: {
					success: "Queue deleted successfully.",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "Are you sure? This action cannot be undone! Services in this queue will continue to exist but won't have any queue assigned.",
				},
			},
			queueSelect: {
				inputLabel: "Queues",
			},
			users: {
				title: "Users",
				table: {
					id: "ID",
					name: "Name",
					email: "Email",
					profile: "Profile",
					actions: "Actions",
				},
				buttons: {
					add: "Add user",
				},
				toasts: {
					deleted: "User deleted successfully.",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "All user data will be lost. Open services for this user will be moved to the queue.",
				},
			},
			todolist: {
				input: "New task",
				buttons: {
					add: "Add",
					save: "Save",
				},
			},
			helps: {
				title: "Help Center",
			},
			schedules: {
				title: "Schedules",
				confirmationModal: {
					deleteTitle: "Are you sure you want to delete this Schedule?",
					deleteMessage: "This action cannot be undone.",
				},
				table: {
					contact: "Contact",
					body: "Message",
					sendAt: "Schedule Date",
					sentAt: "Send Date",
					status: "Status",
					actions: "Actions",
				},
				messages: {
					date: "Date",
					time: "Time",
					event: "Event",
					allDay: "All Day",
					week: "Week",
					work_week: "Schedules",
					day: "Day",
					month: "Month",
					previous: "Previous",
					next: "Next",
					yesterday: "Yesterday",
					tomorrow: "Tomorrow",
					today: "Today",
					agenda: "Agenda",
					noEventsInRange: "No schedules in this period.",
					showMore: "more",
				},
				buttons: {
					add: "New Schedule",
				},
				toasts: {
					deleted: "Schedule deleted successfully.",
				},
			},
			tags: {
				title: "Tags",
				confirmationModal: {
					deleteTitle: "Are you sure you want to delete this Tag?",
					deleteMessage: "This action cannot be undone.",
					deleteAllMessage: "Are you sure you want to delete all Tags?",
					deleteAllTitle: "Delete All",
				},
				table: {
					name: "Name",
					color: "Color",
					tickets: "Tagged Records",
					actions: "Actions",
				},
				buttons: {
					add: "New Tag",
					deleteAll: "Delete All",
				},
				toasts: {
					deletedAll: "All Tags deleted successfully!",
					deleted: "Tag deleted successfully.",
				},
			},
			settings: {
				schedulesUpdated: "Schedules updated successfully.",
				success: "Settings saved successfully.",
				title: "Settings",
				tabs: {
					options: "Options",
					schedules: "Schedules",
					companies: "Companies",
					plans: "Plans",
					helps: "Help",
				},
				options: {
					toasts: {
						success: "Operation updated successfully.",
					},
					fields: {
						ratings: {
							title: "Ratings",
							disabled: "Disabled",
							enabled: "Enabled",
						},
						expedientManager: {
							title: "Business Hours Management",
							queue: "Queue",
							company: "Company",
						},
						ignoreMessages: {
							title: "Ignore Group Messages",
						},
						acceptCall: {
							title: "Accept Call",
							disabled: "Don't accept",
							enabled: "Accept",
						},
						chatbotType: {
							title: "Chatbot Type",
							text: "Text",
						},
						sendGreetingAccepted: {
							title: "Send greeting when accepting ticket",
						},
						sendMsgTransfTicket: {
							title: "Send message on Queue/agent transfer",
						},
						sendGreetingMessageOneQueues: {
							title: "Send greeting when there's only 1 queue",
						},
						disabled: "Disabled",
						active: "Active",
						enabled: "Enabled",
					},
					updating: "Updating...",
					tabs: {
						integrations: "INTEGRATIONS",
					},
				},
				helps: {
					toasts: {
						errorList: "Could not load records list",
						errorOperation: "Could not complete operation",
						error: "Could not complete operation. Check if help with the same name exists or if fields were filled correctly",
						success: "Operation completed successfully!",
					},
					buttons: {
						clean: "Clear",
						delete: "Delete",
						save: "Save",
					},
					grid: {
						title: "Title",
						description: "Description",
						video: "Video",
					},
					confirmModal: {
						title: "Delete Record",
						confirm: "Do you really want to delete this record?",
					},
				},
				company: {
					toasts: {
						errorList: "Could not load records list",
						errorOperation: "Could not complete operation",
						error: "Could not complete operation. Check if company with same name exists or if fields were filled correctly",
						success: "Operation completed successfully!",
					},
					confirmModal: {
						title: "Delete Record",
						confirm: "Do you really want to delete this record?",
					},
					form: {
						name: "Name",
						email: "Email",
						phone: "Phone",
						plan: "Plan",
						status: "Status",
						yes: "Yes",
						no: "No",
						campanhas: "Campaigns",
						enabled: "Enabled",
						disabled: "Disabled",
						dueDate: "Due date",
						recurrence: "Recurrence",
						monthly: "Monthly",
						expire: "Expiration",
						createdAt: "Created On",
					},
					buttons: {
						clear: "Clear",
						delete: "Delete",
						expire: "+ Expiration",
						user: "User",
						save: "Save",
					},
				},
				schedules: {
					form: {
						weekday: "Weekday",
						initialHour: "Start Time",
						finalHour: "End Time",
						save: "Save",
					},
				},
				settings: {
					userCreation: {
						name: "User creation",
						options: {
							enabled: "Enabled",
							disabled: "Disabled",
						},
					},
				},
			},
			messagesList: {
				header: {
					assignedTo: "Assigned to:",
					buttons: {
						return: "Return",
						resolve: "Resolve",
						reopen: "Reopen",
						accept: "Accept",
						download: "Download",
					},
				},
				lostCall: "Missed voice/video call at",
				deletedMessage: "This message was deleted by the contact",
				edited: "Edited",
				saudation: "Say hello to your new contact!",
			},
			messagesInput: {
				placeholderOpen: "Type a message",
				placeholderClosed: "Reopen or accept this ticket to send a message.",
				signMessage: "Sign",
			},
			contactDrawer: {
				header: "Contact Information",
				buttons: {
					edit: "Edit contact",
				},
				extraInfo: "Other information",
			},
			fileModal: {
				title: {
					add: "Add file list",
					edit: "Edit file list",
				},
				buttons: {
					okAdd: "Save",
					okEdit: "Edit",
					cancel: "Cancel",
					fileOptions: "Add file",
				},
				form: {
					name: "File list name",
					message: "List details",
					fileOptions: "File list",
					extraName: "Message to send with file",
					extraValue: "Option value",
				},
				formErrors: {
					name: {
						required: "Name is required",
						short: "Name is too short",
					},
					message: {
						required: "Message is required",
					},
				},
				success: "File list saved successfully!",
			},
			ticketOptionsMenu: {
				schedule: "Schedule",
				delete: "Delete",
				transfer: "Transfer",
				registerAppointment: "Contact Notes",
				appointmentsModal: {
					title: "Contact Notes",
					textarea: "Note",
					placeholder: "Enter the information you want to record here",
				},
				confirmationModal: {
					title: "Delete ticket",
					titleFrom: "from contact ",
					message: "Warning! All messages related to this ticket will be lost.",
				},
				buttons: {
					delete: "Delete",
					cancel: "Cancel",
				},
			},
			confirmationModal: {
				buttons: {
					confirm: "Ok",
					cancel: "Cancel",
				},
			},
			messageOptionsMenu: {
				delete: "Delete",
				reply: "Reply",
				confirmationModal: {
					title: "Delete message?",
					message: "This action cannot be undone.",
				},
			},
			backendErrors: {
				ERR_INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again later",
				ERR_NO_OTHER_WHATSAPP: "There must be at least one default WhatsApp.",
				ERR_NO_DEF_WAPP_FOUND: "No default WhatsApp found. Check the connections page.",
				ERR_WAPP_NOT_INITIALIZED: "This WhatsApp session hasn't been initialized. Check the connections page.",
				ERR_WAPP_CHECK_CONTACT: "Couldn't verify WhatsApp contact. Check the connections page",
				ERR_WAPP_INVALID_CONTACT: "This is not a valid WhatsApp number.",
				ERR_WAPP_DOWNLOAD_MEDIA: "Couldn't download WhatsApp media. Check the connections page.",
				ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
				ERR_USER_DONT_EXISTS: "User not found. Check the provided email.",
				ERR_SENDING_WAPP_MSG: "Error sending WhatsApp message. Check the connections page.",
				ERR_DELETE_WAPP_MSG: "Couldn't delete WhatsApp message.",
				ERR_OTHER_OPEN_TICKET: "There's already an open ticket for this contact.",
				ERR_SESSION_EXPIRED: "Session expired. Please log in.",
				ERR_USER_CREATION_DISABLED: "User creation has been disabled by the administrator.",
				ERR_NO_PERMISSION: "You don't have permission to access this resource.",
				ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
				ERR_NO_SETTING_FOUND: "No settings found with this ID.",
				ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
				ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
				ERR_NO_USER_FOUND: "No user found with this ID.",
				ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
				ERR_CREATING_MESSAGE: "Error creating message in database.",
				ERR_CREATING_TICKET: "Error creating ticket in database.",
				ERR_FETCH_WAPP_MSG: "Error fetching WhatsApp message, it might be too old.",
				ERR_QUEUE_COLOR_ALREADY_EXISTS: "This color is already in use, choose another.",
				ERR_WAPP_GREETING_REQUIRED: "Greeting message is required when there is more than one queue.",
			},
		}
	},
};

export { messages };