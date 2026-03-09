"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createUser } from "@/actions/users";
import { getLocations } from "@/actions/locations";
import { UserPlus, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
enum Role {
  ADMIN = "ADMIN",
  ACCOUNTANT = "ACCOUNTANT",
  SALES = "SALES",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
}

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role),
  passwordRaw: z.string().min(6, "Password must be at least 6 characters"),
  outletIds: z.array(z.string()),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outlets, setOutlets] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getLocations().then((res) => setOutlets(res.outlets));
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: Role.SALES,
      outletIds: [],
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);
      await createUser(data);
      router.push("/dashboard/master-data/users");
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Failed to create user. Ensure email is unique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add New User</h2>
            <p className="text-sm text-slate-500">
              Provision access for a new employee.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/master-data/users"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                {...register("name")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="john@erp.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Initial Password
              </label>
              <input
                type="text"
                {...register("passwordRaw")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Set initial password"
              />
              {errors.passwordRaw && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.passwordRaw.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role
              </label>
              <select
                {...register("role")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {Object.values(Role).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {selectedRole === Role.SALES && (
              <div className="md:col-span-2 pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assigned Outlets (For Sales Role)
                </label>
                <div className="border border-slate-200 rounded-md p-3 space-y-2 max-h-48 overflow-y-auto bg-slate-50">
                  {outlets.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                      No outlets defined.
                    </p>
                  ) : (
                    <Controller
                      name="outletIds"
                      control={control}
                      render={({ field }) => (
                        <>
                          {outlets.map((o) => (
                            <label
                              key={o.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                value={o.id}
                                checked={field.value.includes(o.id)}
                                onChange={(e) => {
                                  const newValues = e.target.checked
                                    ? [...field.value, o.id]
                                    : field.value.filter((id) => id !== o.id);
                                  field.onChange(newValues);
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-800">
                                {o.name}
                              </span>
                            </label>
                          ))}
                        </>
                      )}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
