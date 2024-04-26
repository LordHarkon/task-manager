import { Dialog, Transition } from "@headlessui/react";
import { Priority } from "@prisma/client";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { Fragment, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTrashAlt } from "react-icons/fa";
import { MdOutlineWarningAmber } from "react-icons/md";
import * as Yup from "yup";
import Navbar from "~/components/Navbar";
import { api } from "~/utils/api";

export default function Home() {
  const [isDeletePriorityModalOpen, setIsDeletePriorityModalOpen] = useState(false);
  const [priorityToDelete, setPriorityToDelete] = useState<Priority | null>(null);

  const { data: sessionData } = useSession();
  const { data: tasks } = api.task.getAll.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  });
  const { data: priorities, refetch: refetchPriorities } = api.priority.getAll.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  });
  const priorityCreateMutation = api.priority.create.useMutation();
  const priorityDeleteMutation = api.priority.delete.useMutation();

  useEffect(() => {
    console.log("tasks", tasks);
  }, [tasks]);

  const PrioritySchema = Yup.object().shape({
    name: Yup.string().required().max(512, "Name is too long"),
    value: Yup.number().required(),
  });

  const closeDeleteModal = () => {
    setIsDeletePriorityModalOpen(false);
    setPriorityToDelete(null);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-gray-100">
      <Head>
        <title>Task Manager</title>
        <meta name="description" content="Task Manager is an application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          error: {
            icon: <MdOutlineWarningAmber size={32} className="text-red-500" />,
            style: {
              background: "rgb(39 39 42)",
              color: "rgb(229 231 235)",
            },
          },
        }}
      />
      <div className="container mx-auto bg-zinc-900 p-4 ">
        <h1 className="text-4xl font-bold">Welcome to Task Manager</h1>
        <p className="text-lg">This is a simple task manager application</p>
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks?.map((task) => (
              <div key={task.id} className="rounded-lg bg-zinc-800 p-4 shadow-md">
                <h3 className="text-xl font-bold">{task.name}</h3>
                <p>Completed: {task.completed ? "Yes" : "No"}</p>
                <p>
                  Priority: {task.priority.name} (#{task.priority.value})
                </p>
              </div>
            ))}
          </div>
        </div>
        <Transition appear show={isDeletePriorityModalOpen} as={Fragment}>
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
                      Delete priority Level {priorityToDelete?.value} ({priorityToDelete?.name})
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
                          await priorityDeleteMutation.mutateAsync(priorityToDelete!.id);
                          await refetchPriorities();
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
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Priorities</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {priorities?.map((priority) => (
              <div key={priority.id} className="rounded-lg bg-zinc-800 px-4 py-3 shadow-md">
                <h3 className="text-xl font-bold">{priority.name}</h3>
                <p>Level: {priority.value}</p>
                <button
                  onClick={() => {
                    setIsDeletePriorityModalOpen(true);
                    setPriorityToDelete(priority);
                  }}
                  className="p-2 text-gray-200 hover:text-red-700"
                >
                  <FaTrashAlt size={16} className="pointer-events-none" />
                </button>
                {/* <p>{task.description}</p> */}
              </div>
            ))}
          </div>
          {/* Add Priority */}
          <div className="mt-4">
            <h2 className="text-2xl font-bold">Add Priority</h2>
            <Formik
              initialValues={{
                name: "",
                value: 1,
              }}
              validationSchema={PrioritySchema}
              onSubmit={async (values) => {
                console.log("values", values);
                try {
                  await priorityCreateMutation.mutateAsync(values);
                  await refetchPriorities();
                } catch (error) {
                  toast.error(priorityCreateMutation?.error?.shape?.message ?? "An error occurred");
                  // const errors: TRPCClientError = error.meta.responseJSON;
                }
              }}
            >
              {({ errors, touched }) => (
                <Form className="w-96 border border-white/20 p-2">
                  <div className="py-1">
                    <Field
                      name="name"
                      type="text"
                      placeholder="Name"
                      className="w-full bg-slate-800 px-2 py-1 text-white placeholder:text-gray-400 focus:outline-none"
                    />
                    {errors.name && touched.name ? (
                      <div className="text-xs text-red-500">
                        {errors.name.slice(0, 1).toUpperCase() + errors.name.slice(1)}
                      </div>
                    ) : null}
                  </div>
                  <div className="py-1">
                    <Field
                      name="value"
                      type="number"
                      placeholder="Value"
                      className="w-full bg-slate-800 px-2 py-1 text-white placeholder:text-gray-400 focus:outline-none"
                    />
                    {errors.value && touched.value ? (
                      <div className="text-xs text-red-500">
                        {errors.value.slice(0, 1).toUpperCase() + errors.value.slice(1)}
                      </div>
                    ) : null}
                  </div>
                  <button type="submit" className="bg-zinc-700 px-3 py-1 text-gray-200 hover:bg-zinc-800">
                    Add Priority
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
