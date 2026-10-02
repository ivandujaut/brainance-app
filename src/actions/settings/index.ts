"use server";
import { client } from "@/lib/prisma";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { canAddDomain, domainLimitFor } from "@/domain/plans";
import { isValidDomain } from "@/domain/domains";
import { findOwnedSite } from "@/server/tenancy";

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const user = await currentUser();
  if (!user) return;
  const name = domain.trim().toLowerCase();
  if (!isValidDomain(name)) {
    return { status: 400, message: "El dominio no es válido. Ingresá algo como minegocio.com.ar" };
  }
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
            chatBot: { create: { welcomeMessage: "¡Hola! ¿Tenés alguna consulta? Escribinos acá." } },
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

export const onGetSubscriptionPlan = async () => {
  try {
    const user = await currentUser();
    if (!user) return;
    const plan = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });
    if (plan) {
      return plan.subscription?.plan;
    }
  } catch (error) {
    console.error(error);
  }
};

export const onGetAllAccountDomains = async () => {
  const user = await currentUser();
  if (!user) return;
  try {
    const domains = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        domains: {
          select: {
            name: true,
            icon: true,
            id: true,
            customer: {
              select: {
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return { ...domains };
  } catch (error) {
    console.error(error);
  }
};

export const onUpdatePassword = async (password: string) => {
  try {
    const user = await currentUser();

    if (!user) return null;
    const update = await (await clerkClient()).users.updateUser(user.id, { password });

    if (update) {
      return { status: 200, message: "Password updated successfully" };
    }
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    return { status: 500, message: "No pudimos borrar el sitio. Probá de nuevo." };
  }
};
