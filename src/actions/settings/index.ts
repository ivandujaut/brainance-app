"use server";
import { client } from "@/lib/prisma";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { canAddDomain, domainLimitFor } from "@/domain/plans";
import { defaultWelcome } from "@/domain/bot-settings";
import { isValidDomain } from "@/domain/domains";
import { isOwnIconUrl } from "@/server/storage/icons";
import { findOwnedSite } from "@/server/tenancy";
import { captureError } from "@/server/observability";

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const user = await currentUser();
  if (!user) return;
  const name = domain.trim().toLowerCase();
  if (!isValidDomain(name)) {
    return { status: 400, message: "El dominio no es válido. Ingresá algo como minegocio.com.ar" };
  }
  // Empty means no icon; anything else must come from onUploadIcon (ADR 0011).
  if (icon && !isOwnIconUrl(icon)) return { status: 400, message: "El ícono no es válido. Subilo de nuevo." };
  try {
    const account = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        _count: { select: { domains: true } },
        subscription: { select: { plan: true } },
        domains: { where: { name }, select: { id: true } },
      },
    });
    if (!account) return { status: 400, message: "No encontramos tu cuenta. Volvé a ingresar." };
    if (account.domains.length) return { status: 400, message: "Ese sitio ya está agregado." };

    const plan = account.subscription?.plan;
    if (!canAddDomain({ plan, currentDomains: account._count.domains })) {
      const limit = plan ? domainLimitFor(plan) : 0;
      return {
        status: 400,
        message: `Tu plan permite ${limit === 1 ? "un solo sitio" : `hasta ${limit} sitios`}.`,
      };
    }

    await client.user.update({
      where: { clerkId: user.id },
      data: {
        domains: {
          create: {
            name,
            icon,
            chatBot: { create: { welcomeMessage: defaultWelcome("vos") } },
          },
        },
      },
    });
    return { status: 200, message: "Sitio agregado" };
  } catch (error) {
    console.log(error);
    return { status: 500, message: "No pudimos agregar el sitio. Probá de nuevo." };
  }
};

export const onUpdatePassword = async (password: string) => {
  try {
    const user = await currentUser();

    if (!user) return null;
    const update = await (await clerkClient()).users.updateUser(user.id, { password });

    if (update) {
      return { status: 200, message: "Cambiaste tu contraseña." };
    }
  } catch (error) {
    captureError(error, { area: "settings" });
  }
};

export const onUpdatedDomain = async (id: string, name: string) => {
  const site = await findOwnedSite(id);
  if (!site) return { status: 404, message: "No encontramos ese sitio." };
  const newName = name.trim().toLowerCase();
  if (!isValidDomain(newName)) {
    return { status: 400, message: "El dominio no es válido. Ingresá algo como minegocio.com.ar" };
  }
  try {
    // Names only need to be unique within the owner's own sites.
    const duplicate = await client.domain.findFirst({
      where: { userId: site.userId, name: newName, NOT: { id: site.id } },
      select: { id: true },
    });
    if (duplicate) return { status: 400, message: "Ya tenés un sitio con ese dominio." };

    await client.domain.update({ where: { id: site.id }, data: { name: newName } });
    return { status: 200, message: "Dominio actualizado" };
  } catch (error) {
    captureError(error, { area: "settings" });
    return { status: 500, message: "No pudimos actualizar el dominio. Probá de nuevo." };
  }
};

export const onDeleteUserDomain = async (id: string) => {
  const site = await findOwnedSite(id);
  if (!site) return { status: 404, message: "No encontramos ese sitio." };
  try {
    // Cascades to the bot, FAQs, visitors and conversations.
    await client.domain.delete({ where: { id: site.id } });
    return { status: 200, message: `Borraste ${site.name}` };
  } catch (error) {
    captureError(error, { area: "settings" });
    return { status: 500, message: "No pudimos borrar el sitio. Probá de nuevo." };
  }
};
