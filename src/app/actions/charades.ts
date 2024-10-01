"use server";

import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/db";
import { redirect } from "next/navigation";

export async function addCharade(
  previousState: any,
  formData: FormData
) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      error: "You must be logged in to create a list",
      success: false,
    };
  }
  console.log(formData);
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const words = formData.get("words") as string;

  // validate the inputs
  if (!name || !description || !words) {
    return { error: "Please fill out all fields", success: false };
  }

  // create a new list
  await prismadb.charadeList.create({
    data: {
      userId: user.id,
      name,
      description,
      items: words,
      isPublic: user.role === "ADMIN",
    },
  });

  return redirect("/charades");
}
export async function editCharade(
  previousState: any,
  formData: FormData
) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      error: "You must be logged in to edit a list",
      success: false,
    };
  }
  console.log(formData);
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const words = formData.get("words") as string;
  const charadeId = formData.get("charadeId") as string;

  // validate the inputs
  if (!name || !description || !words) {
    return { error: "Please fill out all fields", success: false };
  }
  const charade = await prismadb.charadeList.findFirst({
    where: { id: charadeId },
  });
  if (charade?.userId !== user.id) {
    return {
      error: "You are not authorized to edit this list",
      success: false,
    };
  }

  // create a new list
  await prismadb.charadeList.update({
    where: { id: charadeId },
    data: {
      userId: user.id,
      name,
      description,
      items: words,
      isPublic: user.role === "ADMIN",
    },
  });

  return redirect("/charades");
}
export async function deleteCharade(charadeId: string) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      error: "You must be logged in to delete a list",
      success: false,
    };
  }
  const charade = await prismadb.charadeList.findFirst({
    where: { id: charadeId },
  });
  if (charade?.userId !== user.id) {
    return {
      error: "You are not authorized to delete this list",
      success: false,
    };
  }

  await prismadb.charadeList.delete({
    where: { id: charadeId },
  });

  return redirect("/charades");
}
