"use server";

import { db } from "@/db";
import { savedPaymentMethodsTable } from "@/db/schema/payment";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const deleteSavedPaymentMethod = actionClient
  .inputSchema(z.object({ paymentMethodId: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const method = await db.query.savedPaymentMethodsTable.findFirst({
      where: and(
        eq(savedPaymentMethodsTable.stripePaymentMethodId, parsedInput.paymentMethodId),
        eq(savedPaymentMethodsTable.userId, session.user.id),
      ),
    });

    if (!method) throw new Error("Método de pagamento não encontrado");

    // Desvincula do Stripe
    await stripe.paymentMethods.detach(parsedInput.paymentMethodId);

    // Remove do banco
    await db
      .delete(savedPaymentMethodsTable)
      .where(
        and(
          eq(savedPaymentMethodsTable.stripePaymentMethodId, parsedInput.paymentMethodId),
          eq(savedPaymentMethodsTable.userId, session.user.id),
        ),
      );

    return { deleted: true };
  });
