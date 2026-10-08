"use client";
import { UploadClient } from "@uploadcare/upload-client";
import { Check } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { onUpdateAppearance } from "@/actions/settings/bot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppearanceSchema, LIMITS, SUGGESTED_COLORS, type Addressing } from "@/domain/bot-settings";
import { AA_CONTRAST, contrastRatio, isHexColor, LIGHT_TEXT, readableTextColor } from "@/domain/color-contrast";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from "@/schemas/settings.schema";
import { Counter, FieldError, Section } from "./section";
import { WelcomeHint } from "./welcome-hint";
import { useActionToast } from "@/hooks/use-action-toast";

export type Look = { background: string; welcomeMessage: string; icon: string | null };

type Props = { siteId: string; look: Look; onChange: (look: Look) => void; addressing: Addressing };
type Errors = Partial<Record<keyof Look, string>>;

export const AppearanceForm = ({ siteId, look, onChange, addressing }: Props) => {
  const notify = useActionToast();
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (patch: Partial<Look>) => onChange({ ...look, ...patch });

  const validColor = isHexColor(look.background);
  const textColor = validColor ? readableTextColor(look.background) : null;
  const meetsAA = validColor && contrastRatio(look.background, textColor!) >= AA_CONTRAST;

  const onIcon = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_FILE_TYPES.includes(file.type) || file.size > MAX_UPLOAD_SIZE) {
      setErrors((e) => ({ ...e, icon: "El ícono tiene que ser PNG o JPG de hasta 2 MB." }));
      return;
    }
    setUploading(true);
    try {
      const upload = new UploadClient({ publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string });
      const uploaded = await upload.uploadFile(file);
      setErrors((e) => ({ ...e, icon: undefined }));
      set({ icon: uploaded.uuid });
    } catch {
      setErrors((e) => ({ ...e, icon: "No pudimos subir la imagen. Probá de nuevo." }));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = AppearanceSchema.safeParse(look);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        background: fieldErrors.background?.[0],
        welcomeMessage: fieldErrors.welcomeMessage?.[0],
        icon: fieldErrors.icon?.[0],
      });
      return;
    }
    setErrors({});
    setSaving(true);
    const result = await onUpdateAppearance(siteId, parsed.data);
    setSaving(false);
    notify(result);
  };

  return (
    <Section id="apariencia" title="Apariencia" description="Cómo se ve el chat en tu sitio. La vista previa cambia mientras editás.">
      <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium mb-2">Color principal</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colores sugeridos">
            {SUGGESTED_COLORS.map((color) => {
              const selected = look.background.toUpperCase() === color;
              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={color}
                  onClick={() => set({ background: color })}
                  className={cn(
                    "h-9 w-9 rounded-full border flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selected && "ring-2 ring-ring ring-offset-2",
                  )}
                  style={{ backgroundColor: color, color: readableTextColor(color) }}
                >
                  {selected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="color-picker" className="sr-only">
              Elegir otro color
            </Label>
            <input
              id="color-picker"
              type="color"
              value={validColor ? look.background : "#000000"}
              onChange={(e) => set({ background: e.target.value.toUpperCase() })}
              className="h-10 w-12 cursor-pointer rounded border bg-background"
            />
            <Label htmlFor="color-hex" className="sr-only">
              Color en hexadecimal
            </Label>
            <Input
              id="color-hex"
              data-testid="color-hex"
              value={look.background}
              onChange={(e) => set({ background: e.target.value.trim() })}
              className="w-32 font-mono"
              maxLength={7}
            />
          </div>
          {validColor && (
            <p className="text-sm text-muted-foreground" data-testid="text-color-note">
              El texto sobre este color va en {textColor === LIGHT_TEXT ? "blanco" : "negro"}
              {meetsAA ? " para que se lea bien." : ". Es la opción más legible, pero conviene un color más claro u oscuro."}
            </p>
          )}
          <FieldError message={errors.background} />
        </fieldset>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Ícono</span>
          <div className="flex flex-wrap items-center gap-3">
            <Label
              htmlFor="icon-upload"
              className={cn(
                "cursor-pointer rounded-md border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                uploading && "pointer-events-none opacity-50",
              )}
            >
              {uploading ? "Subiendo…" : look.icon ? "Cambiar ícono" : "Subir ícono"}
            </Label>
            <input id="icon-upload" type="file" accept={ACCEPTED_FILE_TYPES.join(",")} className="sr-only" onChange={onIcon} />
            {look.icon && (
              <Button type="button" variant="ghost" onClick={() => set({ icon: null })}>
                Quitar ícono
              </Button>
            )}
            <span className="text-sm text-muted-foreground">PNG o JPG cuadrado, de hasta 2 MB. Sin ícono se muestra la inicial.</span>
          </div>
          <FieldError message={errors.icon} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <Label htmlFor="welcome-message">Mensaje de bienvenida</Label>
            <Counter value={look.welcomeMessage} max={LIMITS.welcomeMessage} />
          </div>
          <Textarea
            id="welcome-message"
            rows={2}
            value={look.welcomeMessage}
            onChange={(e) => set({ welcomeMessage: e.target.value })}
          />
          <FieldError message={errors.welcomeMessage} />
          <WelcomeHint welcome={look.welcomeMessage} addressing={addressing} where="apariencia" />
        </div>

        <Button type="submit" disabled={saving || uploading} className="self-end" data-testid="save-appearance">
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </form>
    </Section>
  );
};
