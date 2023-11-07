$(document).ready(() => {
	// DOM elements
	const $addTaskForm = $("#taskForm");
	const $titleInput = $("#titleInput");
	const $descriptionInput = $("#descriptionInput");
	const $dateInput = $("#dateInput");
	const $modal = new bootstrap.Modal("#taskModal");

	/**
	 * Creates an icon button element and associates a click handler with it
	 *
	 * @param {string} iconClass - the class of the icon to be displayed on the button
	 * @param {Function} clickHandler - the function to be called when the button is clicked
	 * @returns {jQuery} - jQuery object representing the created icon button
	 */
	const createIconButton = (iconClass, clickHandler) => {
		const $button = $("<button></button>").addClass("btn").click(clickHandler);
		const $span = $("<span></span>").append($("<i></i>").addClass(iconClass));
		$button.append($span);
		return $button;
	};

	/**
	 * Generates a unique ID based on the provided base name
	 *
	 * @param {string} idName - the base name for the ID
	 * @returns {string} a unique ID based on the base name
	 */
	let lastID;
	const dynamicIDCreation = (idName) => {
		const countBaseName = idName;
		const allOccurrencesNames = $("[id]");

		let maxIDCounter = 0;
		allOccurrencesNames.each(function () {
			const currentID = this.id;
			if (currentID.startsWith(countBaseName)) {
				const idNumber = parseInt(currentID.substring(countBaseName.length + 1));
				if (!isNaN(idNumber) && idNumber > maxIDCounter) {
					maxIDCounter = idNumber;
				}
			}
		});

		const newID = idName + "-" + (maxIDCounter + 1);

		if (newID === lastID) {
			lastID = idName + "-" + (maxIDCounter + 2);
			return lastID;
		}

		lastID = newID;
		return newID;
	};

	/**
	 * The function will return the current date formatted as a string
	 *
	 * @param {string} dateInput - a string representing the date in the format YYYY-MM-DD
	 * @returns {string} If (dateInput) corresponds to the current date, it will return "hoje"
	 * If (dateInput) corresponds to the next day, it will return "amanhã"
	 * Otherwise, it will return the date formatted as DD-MM-YYYY if the current date does not match the other cases
	 */
	const dateFormatter = (dateInput) => {
		const currentDate = dayjs();
		const formatter = (date) => {
			return date.format("YYYY-MM-DD");
		};

		const today = formatter(currentDate);
		if (today === dateInput || dateInput === "") {
			return "Hoje";
		}

		const tomorrowDate = currentDate.add(1, "day");
		const tomorrow = formatter(tomorrowDate);

		if (tomorrow === dateInput) {
			return "Amanhã";
		} else {
			const year = dateInput.slice(0, 4);
			const month = dateInput.slice(5, 7);
			const day = dateInput.slice(-2);
			const fullDate = day + "/" + month + "/" + year;
			return fullDate;
		}
	};

	/**
	 * Creates a task item dynamically to a task board
	 *
	 * @param {string} title - the title of the task
	 * @param {string} description - the description of the task
	 * @param {string} date - the date associated with the task
	 */
	const addTaskToBoard = (title, description, date, board = "todo") => {
		const $newTask = $("<div></div>").addClass("taskItem").attr("id", dynamicIDCreation("newTask"));
		const $container = $("<div></div>").addClass("bg-primary d-flex align-items-center gap-2 p-0");
		$newTask.append($container);

		const $collapseName = dynamicIDCreation("collapseTask");

		const $iconColumn = $("<div></div>")
			.addClass("col-2 taskIcon")
			.attr("data-bs-toggle", "collapse")
			.attr("href", `#${$collapseName}`);

		const $icon = $("<span></span>").append($("<i></i>").addClass("fa-solid fa-bars"));

		$iconColumn.append($icon);
		$newTask.append($iconColumn);

		$container.append($iconColumn);

		const $infoColumn = $("<div></div>").addClass("col-4 overflow-x-hidden d-flex flex-grow-1 justify-content-start");
		const $infoBlock = $("<div></div").addClass("d-block");
		$infoBlock.append($("<span></span").addClass("fw-medium").text(title).attr("id", "title"));
		const dateInfo = $("<div></div").addClass("dateMargin");
		dateInfo.append($("<i></i>").addClass("fa-regular fa-calendar"));
		dateInfo.append($("<span></span").addClass("fw-lighter").text(dateFormatter(date)));
		$infoBlock.append(dateInfo);
		$infoColumn.append($infoBlock);
		$container.append($infoColumn);

		// Delete task button
		const $actionColumn = $("<div></div").addClass("col d-flex gap-1 mx-1 text-center align-items-center iconGap");
		$actionColumn.append(
			createIconButton("fa-solid fa-trash", () => {
				$newTask.remove();
				$collapseElement.remove();
			})
		);

		// Edit task button
		$actionColumn.append(
			createIconButton("fa-solid fa-pen-to-square", () => {
				const $taskModal = $("#taskModal");
				const $modalTitle = $("#taskModal .modal-title");
				const $modalConfirmButton = $("#taskModal .btn-primary");

				$modalTitle.text("Editar tarefa");
				$modalConfirmButton.text("Salvar Alterações");

				$("[id^='newTask']").off("click");
				$("[id^='newTask']").on("click", function () {
					$currentlySelectedTask = this.id;
				});

				$modalConfirmButton.on("click", function () {
					if ($addTaskForm[0].checkValidity()) {
						$(`#${$currentlySelectedTask}`).remove();
						$collapseElement.remove();
					}
				});

				$taskModal.off("hidden.bs.modal");
				$taskModal.on("hidden.bs.modal", function () {
					$modalTitle.text("Adicionar Tarefa");
					$modalConfirmButton.text("Salvar Tarefa");
					$currentlySelectedTask = null;
				});
			})
				.attr("data-bs-toggle", "modal")
				.attr("data-bs-target", "#taskModal")
		);

		let iconBoard;
		if (board === "todo") {
			iconBoard = "fa-solid fa-clock";
		} else if (board === "done") {
			iconBoard = "fa-solid fa-check";
		} else {
			iconBoard = "fa-solid fa-xmark";
		}

		// Change progress button
		$actionColumn.append(
			createIconButton(iconBoard, (event) => {
				const $icon = $(event.target);
				const $taskItem = $(event.target).closest(".taskItem");
				const $taskColumn = $(event.target).closest("div[id^='todo'], div[id^='done'], div[id^='pendent']");

				$taskItem.fadeOut(100, function () {
					if ($taskColumn.attr("id") === "todo") {
						$taskItem.appendTo("#done");
						$icon.removeClass("fa-solid fa-clock").addClass("fa-solid fa-check");
					} else if ($taskColumn.attr("id") === "done") {
						$taskItem.appendTo("#pendent");
						$icon.removeClass("fa-solid fa-check").addClass("fa-solid fa-xmark");
					} else if ($taskColumn.attr("id") === "pendent") {
						$taskItem.appendTo("#todo");
						$icon.removeClass("fa-solid fa-xmark").addClass("fa-solid fa-clock");
					}
					$taskItem.fadeIn(100);
				});
			})
		);
		$container.append($actionColumn);

		const $collapseElement = $("<div></div>").addClass("collapse").attr("id", `${$collapseName}`);
		const $collapseContent = $("<div></div>").addClass("card card-body");
		$collapseContent.append($("<span></span").addClass("fw-medium").text(title));
		$collapseContent.append($("<p></p").text(description));
		$collapseElement.append($collapseContent);
		$newTask.append($collapseElement);

		$(`#${board}`).append($newTask);
	};

	// Define the minimun date from (dateInput)
	const todayDate = dayjs();
	const formattedDate = todayDate.format("YYYY-MM-DD");
	$dateInput.attr("min", formattedDate);

	// Attach a submit event handler
	$addTaskForm.submit((event) => {
		event.preventDefault();

		if ($addTaskForm[0].checkValidity()) {
			addTaskToBoard($titleInput.val(), $descriptionInput.val(), $dateInput.val());

			$addTaskForm[0].reset();
			$modal.hide();
			$addTaskForm.removeClass("was-validated");
		} else {
			$addTaskForm.addClass("was-validated");
		}
	});

	/**
	 * Extract the tasks and organize them by board name
	 *
	 * @param {string} boardName the ID of the board containing tasks
	 * @param {string} taskItemName the class name of task items within the board
	 * @returns {Object} an object containing tasks organized by board name
	 */
	const gettingTasksFromBoards = (boardName, taskItemName) => {
		const allTasks = { [boardName]: [] };

		const $tasks = $(`#${boardName}`).find(`.${taskItemName}`);
		$tasks.each(function () {
			const taskTitle = $(this).find("#title").text();
			const taskDescription = $(this).find("p").text();
			let taskDate = $(this).find(".fw-lighter").text();

			if (taskDate === "Hoje") {
				const currentDate = dayjs();
				const dateFormatted = currentDate.format("YYYY-MM-DD");
				taskDate = dateFormatted;
			} else if (taskDate === "Amanhã") {
				const currentDate = dayjs();
				const tomorrow = currentDate.add(1, "day");
				const dateFormatted = tomorrow.format("YYYY-MM-DD");
				taskDate = dateFormatted;
			}

			const task = { title: taskTitle, description: taskDescription, date: taskDate };
			allTasks[boardName].push(task);
		});

		return allTasks;
	};

	/**
	 * Get the current tasks from the web page and save them in the local storage
	 */
	const saveTasksToLocalStorage = () => {
		const allTasks = [];

		const tasksToDo = gettingTasksFromBoards("todo", "taskItem");
		const tasksDone = gettingTasksFromBoards("done", "taskItem");
		const tasksPendent = gettingTasksFromBoards("pendent", "taskItem");

		allTasks.push(tasksToDo);
		allTasks.push(tasksDone);
		allTasks.push(tasksPendent);

		localStorage.setItem("tasks", JSON.stringify(allTasks));
	};

	$(window).on("beforeunload", () => {
		saveTasksToLocalStorage();
	});

	const loadTasksFromLocalStorage = () => {
		const tasks = JSON.parse(localStorage.getItem("tasks"));

		tasks.forEach((task) => {
			const todoTasks = task["todo"];
			const doneTasks = task["done"];
			const pendentTasks = task["pendent"];

			if (todoTasks) {
				todoTasks.forEach((todoTask) => {
					const taskTitle = todoTask["title"];
					const taskDescription = todoTask["description"];
					const taskDate = todoTask["date"];

					addTaskToBoard(taskTitle, taskDescription, taskDate);
				});
			}

			if (doneTasks) {
				doneTasks.forEach((doneTask) => {
					const taskTitle = doneTask["title"];
					const taskDescription = doneTask["description"];
					const taskDate = doneTask["date"];

					addTaskToBoard(taskTitle, taskDescription, taskDate, "done");
				});
			}

			if (pendentTasks) {
				pendentTasks.forEach((pendentTask) => {
					const taskTitle = pendentTask["title"];
					const taskDescription = pendentTask["description"];
					const taskDate = pendentTask["date"];

					addTaskToBoard(taskTitle, taskDescription, taskDate, "pendent");
				});
			}
		});
	};

	loadTasksFromLocalStorage();
});
