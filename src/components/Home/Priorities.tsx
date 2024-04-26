import { Dialog, Transition } from "@headlessui/react";
import { type Priority } from "@prisma/client";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import { BsPlusCircleDotted } from "react-icons/bs";
import { FaTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import * as Yup from "yup";
import { api } from "~/utils/api";

const Priorities = () => {
  const [isDeletePriorityModalOpen, setIsDeletePriorityModalOpen] = useState(false);
  const [priorityToDelete, setPriorityToDelete] = useState<Priority | null>(null);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);

  const { data: sessionData } = useSession();

  const { data: priorities, refetch: refetchPriorities } = api.priority.getAll.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  });
  const priorityCreateMutation = api.priority.create.useMutation();
  const priorityDeleteMutation = api.priority.delete.useMutation();

  const PrioritySchema = Yup.object().shape({
    name: Yup.string().required().max(512, "Name is too long"),
    value: Yup.number().required(),
  });

  const closeDeleteModal = () => {
    setIsDeletePriorityModalOpen(false);
    setPriorityToDelete(null);
  };

  return (
    <>
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
                      This will permanently delete the task! Are you sure you want to delete it?
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
                        try {
                          await priorityDeleteMutation.mutateAsync(priorityToDelete!.id);
                          await refetchPriorities();
                          closeDeleteModal();
                        } catch (error) {
                          toast.error(priorityDeleteMutation?.error?.shape?.message ?? "An error occurred");
                          closeDeleteModal();
                        }
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
                    <span>Add Priority</span>
                    <IoMdClose size={24} className="cursor-pointer" onClick={() => setIsAddModelOpen(false)} />
                  </Dialog.Title>
                  <Formik
                    initialValues={{
                      name: "",
                      value: 1,
                    }}
                    validationSchema={PrioritySchema}
                    onSubmit={async (values, helpers) => {
                      console.log("values", values);
                      try {
                        await priorityCreateMutation.mutateAsync(values);
                        await refetchPriorities();
                        helpers.resetForm();
                        setIsAddModelOpen(false);
                      } catch (error) {
                        toast.error(priorityCreateMutation?.error?.shape?.message ?? "An error occurred");
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
                            placeholder="Name"
                            className="w-full bg-zinc-900 px-2 py-1 text-white placeholder:text-gray-400 focus:outline-none"
                          />
                          {errors.name && touched.name ? (
                            <div className="ml-2 text-xs text-red-500">
                              {errors.name.slice(0, 1).toUpperCase() + errors.name.slice(1)}
                            </div>
                          ) : null}
                        </div>
                        <div className="py-1">
                          <label htmlFor="value" className="text-gray-200">
                            Value
                          </label>
                          <Field
                            name="value"
                            id="value"
                            type="number"
                            placeholder="Value"
                            className="w-full bg-zinc-900 px-2 py-1 text-white placeholder:text-gray-400 focus:outline-none"
                          />
                          {errors.value && touched.value ? (
                            <div className="ml-2 text-xs text-red-500">
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
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <div className="mt-4">
        <h2 className="text-2xl font-bold">Priorities</h2>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {priorities?.map((priority) => (
            <div key={priority.id} className="rounded-lg bg-zinc-800 px-4 py-3 shadow-md">
              <div className="flex items-start">
                <h3 className="w-full text-xl font-bold">{priority.name}</h3>
                <button
                  onClick={() => {
                    setIsDeletePriorityModalOpen(true);
                    setPriorityToDelete(priority);
                  }}
                  className="p-2 text-gray-200 hover:text-red-700"
                >
                  <FaTrashAlt size={16} className="pointer-events-none" />
                </button>
              </div>
              <p>Level {priority.value}</p>
            </div>
          ))}
          <div
            className="cursor-pointer rounded-lg border-2 border-dotted border-white/40 bg-zinc-800 p-4 shadow-md"
            onClick={() => setIsAddModelOpen(true)}
          >
            <div className="pointer-events-none flex h-full items-center justify-center">
              <BsPlusCircleDotted size={44} className="pointer-events-none text-white/40" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Priorities;
