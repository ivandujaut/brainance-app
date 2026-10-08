import { Alert, AlertDescription } from "@/components/ui/alert";
import { welcomeNeedsReview, type Addressing } from "@/domain/bot-settings";

type Props = { welcome: string; addressing: Addressing; where: "negocio" | "apariencia" };

/** QA of spec 013: a formal business whose own welcome speaks informally gets a warning. */
export const WelcomeHint = ({ welcome, addressing, where }: Props) =>
  welcomeNeedsReview(welcome, addressing) ? (
    <Alert data-testid="welcome-hint">
      <AlertDescription>
        Tu mensaje de bienvenida está escrito de vos: «{welcome.trim()}».{" "}
        {where === "negocio" ? (
          <>
            Cambialo en{" "}
            <a href="#apariencia" className="underline underline-offset-2">
              Apariencia
            </a>{" "}
            para que el chat salude de usted.
          </>
        ) : (
          "Cambialo para que el chat salude de usted, como elegiste en Negocio."
        )}
      </AlertDescription>
    </Alert>
  ) : null;
