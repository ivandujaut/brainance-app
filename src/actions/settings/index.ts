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

export const onGetCurrentDomainInfo = async (domain: string) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const userDomain = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
        domains: {
          where: {
            name: {
              contains: domain,
            },
          },
          select: {
            id: true,
            name: true,
            icon: true,
            userId: true,
            chatBot: {
              select: {
                id: true,
                welcomeMessage: true,
                icon: true,
              },
            },
          },
        },
      },
    });
    if (userDomain) {
      return userDomain;
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

export const onChatBotImageUpdate = async (id: string, icon: string) => {
  const site = await findOwnedSite(id);
  if (!site) return { status: 404, message: "No encontramos ese sitio." };
  try {
    await client.chatBot.update({ where: { domainId: site.id }, data: { icon } });
    return { status: 200, message: "Ícono actualizado" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "No pudimos actualizar el ícono. Probá de nuevo." };
  }
};

export const onUpdateWelcomeMessage = async (domainId: string, message: string) => {
  const site = await findOwnedSite(domainId);
  if (!site) return { status: 404, message: "No encontramos ese sitio." };
  try {
    await client.chatBot.update({ where: { domainId: site.id }, data: { welcomeMessage: message } });
    return { status: 200, message: "Mensaje de bienvenida actualizado" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "No pudimos guardar el mensaje. Probá de nuevo." };
  }
};

export const onDeleteUserDomain = async (id: string) => {
  const user = await currentUser();
  if (!user) return;
  try {
    //first verify that domain belongs to user
    const validUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
      },
    });
    if (validUser) {
      //check that domain belongs to this user and delete
      const deletedDomain = await client.domain.delete({
        where: {
          userId: validUser.id,
          id,
        },
        select: {
          name: true,
        },
      });

      if (deletedDomain) {
        return { status: 200, message: `${deletedDomain.name} was deleted successfully` };
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export const onCreateHelpDeskQuestion = async (id: string, question: string, answer: string) => {
  const site = await findOwnedSite(id);
  if (!site) return { status: 404, message: "No encontramos ese sitio.", questions: [] };
  try {
    await client.helpDesk.create({ data: { domainId: site.id, question, answer } });
    const questions = await client.helpDesk.findMany({
      where: { domainId: site.id },
      select: { id: true, question: true, answer: true },
    });
    return { status: 200, message: "Pregunta frecuente agregada", questions };
  } catch (error) {
    console.error(error);
  }
};

export const onGetAllHelpDeskQuestions = async (id: string) => {
  const site = await findOwnedSite(id);
  if (!site) return;
  try {
    const questions = await client.helpDesk.findMany({
      where: { domainId: site.id },
      select: { question: true, answer: true, id: true },
    });
    return { status: 200, message: "", questions };
  } catch (error) {
    console.error(error);
  }
};

export const onCreateFilterQuestions = async (id: string, question: string) => {
  const site = await findOwnedSite(id);
  if (!site) return { status: 404, message: "No encontramos ese sitio.", questions: [] };
  try {
    await client.filterQuestions.create({ data: { domainId: site.id, question } });
    const questions = await client.filterQuestions.findMany({
      where: { domainId: site.id },
      select: { id: true, question: true },
    });
    return { status: 200, message: "Pregunta agregada", questions };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "No pudimos guardar la pregunta. Probá de nuevo." };
  }
};

export const onGetAllFilterQuestions = async (id: string) => {
  const site = await findOwnedSite(id);
  if (!site) return;
  try {
    const questions = await client.filterQuestions.findMany({
      where: { domainId: site.id },
      select: { question: true, id: true },
      orderBy: { question: "asc" },
    });
    return { status: 200, message: "", questions };
  } catch (error) {
    console.error(error);
  }
};
