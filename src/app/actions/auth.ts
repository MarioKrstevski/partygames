"use server";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ActionResult } from "@/components/Form";
import prismadb from "@/lib/db";
import { Argon2id } from "oslo/password";
import { UserRoles } from "../global/data";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
export async function logout() {
  const sessionCookie = await lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  cookies().set("auth-cookie-exists", "", {
    ...sessionCookie.attributes,
    httpOnly: false,
  });
  redirect("/");
}
export async function signIn(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email")?.toString();

  if (!email || !emailRegex.test(email)) {
    return {
      error: "Invalid email",
      success: false,
    };
  }
  const password = formData.get("password");
  console.log("Existing user", email, password);

  if (typeof password !== "string" || password.length <= 8) {
    return {
      error: "Invalid password",
      success: false,
    };
  }
  console.log("Existing user", email, password);

  const existingUser = await prismadb.user.findFirst({
    where: {
      email,
    },
  });

  console.log("Existing user", existingUser);
  if (!existingUser) {
    return {
      error: "User with that email doesn't exist",
      success: false,
    };
  }

  console.log("Existing user", existingUser);

  const validPassword = await new Argon2id().verify(
    existingUser.hashedPassword!,
    password
  );

  if (!validPassword) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid usernames from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid usernames.
    // However, valid usernames can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is non-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling, 2FA, etc.
    // If usernames are public, you can outright tell the user that the username is invalid.
    return {
      error: "Incorrect username or password",
      success: false,
    };
  }
  console.log("Existing userai", existingUser);
  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  cookies().set("auth-cookie-exists", existingUser.id, {
    ...sessionCookie.attributes,
    httpOnly: false,
  });

  return redirect("/");
}

export async function signUp(
  _: any,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const username = formData.get("username")?.toString();
  const confirmPassword = formData
    .get("confirm-password")
    ?.toString();

  if (!email || !emailRegex.test(email)) {
    return {
      error: "Invalid email",
      success: false,
    };
  }

  if (!username || username.length < 3) {
    return {
      error: "Invalid email",
      success: false,
    };
  }
  if (typeof password !== "string" || password.length <= 5) {
    return {
      error:
        "Invalid password, it must be more than 5 characters long",
      success: false,
    };
  }

  if (
    typeof confirmPassword !== "string" ||
    confirmPassword !== password
  ) {
    return {
      error: "Make sure confirm password matches password",
      success: false,
    };
  }

  try {
    const existingEmailUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmailUser) {
      return {
        error: "An account with that email already exists",
        success: false,
      };
    }
    const existingUsernameUser = await prismadb.user.findUnique({
      where: {
        username,
      },
    });
    if (existingUsernameUser) {
      return {
        error: "An account with that username already exists",
        success: false,
      };
    }
    const hashedPassword = await new Argon2id().hash(password);

    const user = await prismadb.user.create({
      data: {
        username,
        role: UserRoles.USER,
        email,
        hashedPassword,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    cookies().set("auth-cookie-exists", user.id, {
      ...sessionCookie.attributes,
      httpOnly: false,
    });
  } catch (error) {
    return {
      error: "Something went wrong",
      success: false,
    };
  }

  return redirect("/");
}
