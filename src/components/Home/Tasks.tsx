import { Dialog, Transition } from "@headlessui/react";
import { type Task } from "@prisma/client";
import clsx from "clsx";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import { BsPlusCircleDotted } from "react-icons/bs";
import { FaCheckCircle, FaTrashAlt } from "react-icons/fa";
import { FaCircleHalfStroke } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import * as Yup from "yup";
import { api } from "~/utils/api";

const Tasks = () => {
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);

  const { data: sessionData } = useSession();

  const { data: tasks, refetch: refetchTasks } = api.task.getAll.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  });
  const { data: priorities } = api.priority.getAll.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  });
  const taskCreateMutation = api.task.create.useMutation();
  const markAsCompletedMutation = api.task.markAsCompleted.useMutation();
  const markAsNotCompletedMutation = api.task.markAsNotCompleted.useMutation();
  const taskDeleteMutation = api.task.delete.useMutation();

  const TaskSchema = Yup.object().shape({
    name: Yup.string().required().max(512, "Name is too long"),
    description: Yup.string().max(8192, "Description is too long").optional(),
    completed: Yup.boolean(),
    deadline: Yup.string().optional(),
    priority: Yup.string().required(),
  });

  const closeDeleteModal = () => {
    setIsDeleteTaskModalOpen(false);
    setTaskToDelete(null);
  };

  const formatDate = (date: Date) => {
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getFullYear()}`;
    const daysUntilOrPassed = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return `${formattedDate} (${daysUntilOrPassed === 0 ? "today" : `${Math.abs(daysUntilOrPassed)} day${daysUntilOrPassed === 1 ? "" : "s"} ${daysUntilOrPassed < 0 ? "ago" : "left"}`})`;
  };

  return (
    <>
      <Transition appear show={isDeleteTaskModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-200">
                    Delete task {taskToDelete?.name}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      This will permanently delete the priority! Are you sure you want to delete it?
                    </p>
                  </div>

                  <div className="float-end mt-4 space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-zinc-700 px-4 py-2 text-sm font-medium text-blue-200 hover:bg-zinc-600 focus:outline-none"
                      onClick={closeDeleteModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-red-500 focus:outline-none"
                      onClick={async () => {
                        await taskDeleteMutation.mutateAsync(taskToDelete!.id);
                        await refetchTasks();
                        closeDeleteModal();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isAddModelOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddModelOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="flex items-center justify-between border-b border-white/20 pb-1 text-lg font-medium leading-6 text-gray-200"
                  >
                    <span>Add Task</span>
                    <IoMdClose size={24} className="cursor-pointer" onClick={() => setIsAddModelOpen(false)} />
                  </Dialog.Title>
                  <Formik
                    initialValues={{
                      name: "",
                      description: "",
                      completed: false,
                      deadline: "",
                      priority: "",
                    }}
                    validationSchema={TaskSchema}
                    onSubmit={async (values, helpers) => {
                      console.log("values", values);
                      try {
                        await taskCreateMutation.mutateAsync(values);
                        await refetchTasks();
                        helpers.resetForm();
                        setIsAddModelOpen(false);
                      } catch (error) {
                        toast.error(taskCreateMutation?.error?.shape?.message ?? "An error occurred");
                        setIsAddModelOpen(false);
                      }
                    }}
                  >
                    {({ errors, touched }) => (
                      <Form className="w-full text-gray-200">
                        <div className="py-1">
                          <label htmlFor="name" className="text-gray-200">
                            Name
                          </label>
                          <Field
                            name="name"
                            id="name"
                            type="text"
                            placeholder="Name of the task"
                            className="w-full bg-zinc-900 px-2 py-1 text-white placeholder:text-gray-400 focus:outline-none"
                          />
                          {errors.name && touched.name ? (
                            <div className="ml-2 text-xs text-red-500">
                              {errors.name.slice(0, 1).toUpperCase() + errors.name.slice(1)}
                            </div>
                          ) : null}
                        </div>
                        <div className="py-1">
                          <label htmlFor="description" className="text-gray-200">
                            Description
                          </label>
                          <Field
                            name="description"
                            id="description"
                            as="textarea"
                            rows={5}
                            placeholder="Your description here..."
                            className="w-full resize-none bg-zinc-900 px-2 py-1 text-white placeholder:text-gray-400 focus:outline-none"
                          />
                          {errors.description && touched.description ? (
                            <div className="ml-2 text-xs text-red-500">
                              {errors.description.slice(0, 1).toUpperCase() + errors.description.slice(1)}
                            </div>
                          ) : null}
                        </div>
                        <div className="py-1">
                          <label htmlFor="deadline" className="text-gray-200">
                            Deadline
                          </label>
                          <Field
                            name="deadline"
                            id="deadline"
                            type="date"
                            className="w-full bg-zinc-900 px-2 py-1 text-white accent-white placeholder:text-gray-400 focus:outline-none"
                            style={{ colorScheme: "dark" }}
                          />
                          {errors.deadline && touched.deadline ? (
                            <div className="ml-2 text-xs text-red-500">
                              {errors.deadline.slice(0, 1).toUpperCase() + errors.deadline.slice(1)}
                            </div>
                          ) : null}
                        </div>
                        <div className="py-1">
                          <label htmlFor="priority" className="text-gray-200">
                            Priority
                          </label>
                          <Field
                            name="priority"
                            id="priority"
                            as="select"
                            className="w-full bg-zinc-900 px-2 py-1 text-white placeholder:text-gray-400 focus:outline-none"
                          >
                            <option value="">Select a priority</option>
                            {priorities?.map((priority) => (
                              <option key={priority.id} value={priority.id}>
                                Level {priority.value} – {priority.name}
                              </option>
                            ))}
                          </Field>
                          {errors.priority && touched.priority ? (
                            <div className="ml-2 text-xs text-red-500">
                              {errors.priority.slice(0, 1).toUpperCase() + errors.priority.slice(1)}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center space-x-1 py-1">
                          <Field
                            name="completed"
                            id="completed"
                            type="checkbox"
                            className="h-4 w-4 accent-zinc-800"
                            style={{ appearance: "auto" }}
                          />
                          <label htmlFor="completed" className="ml-2 select-none">
                            Completed
                          </label>
                        </div>

                        <button type="submit" className="bg-zinc-900 px-3 py-1 text-gray-200 hover:bg-zinc-900/50">
                          Add Task
                        </button>
                      </Form>
                    )}
                  </Formik>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <div className="mt-4">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks?.map((task) => (
            <div
              key={task.id}
              className={clsx("rounded-lg border bg-zinc-800 p-4 shadow-md", {
                "border-yellow-200": task.completed,
                "border-blue-200": !task.completed,
              })}
            >
              <div className="flex items-start">
                <h3 className="w-full text-xl font-bold">{task.name}</h3>
                {task.completed ? (
                  <button
                    onClick={async () => {
                      await markAsNotCompletedMutation.mutateAsync(task.id);
                      await refetchTasks();
                    }}
                    className="p-2 text-gray-200 hover:text-blue-300"
                    title="Mark as not completed"
                  >
                    <FaCircleHalfStroke size={16} className="pointer-events-none" />
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await markAsCompletedMutation.mutateAsync(task.id);
                      await refetchTasks();
                    }}
                    className="p-2 text-gray-200 hover:text-yellow-300"
                    title="Mark as completed"
                  >
                    <FaCheckCircle size={16} className="pointer-events-none" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsDeleteTaskModalOpen(true);
                    setTaskToDelete(task);
                  }}
                  className="p-2 text-gray-200 hover:text-red-700"
                >
                  <FaTrashAlt size={16} className="pointer-events-none" />
                </button>
              </div>
              <p>Completed: {task.completed ? "Yes" : "No"}</p>
              <p>
                Priority: Level {task.priority.value} – {task.priority.name}
              </p>
              {task.deadline && <p>Deadline: {formatDate(new Date(task.deadline))}</p>}
              <p>{task.description}</p>
            </div>
          ))}
          <div
            className="cursor-pointer rounded-lg border-4 border-dotted border-white/40 bg-zinc-800 p-4 shadow-md"
            onClick={() => setIsAddModelOpen(true)}
          >
            <div className="pointer-events-none flex h-full items-center justify-center">
              <BsPlusCircleDotted size={96} className="pointer-events-none text-white/40" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;
