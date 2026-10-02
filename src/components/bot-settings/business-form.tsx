"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { onUpdateBusinessInfo, type SiteSettings } from "@/actions/settings/bot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { BusinessInfoSchema, LIMITS } from "@/domain/bot-settings";
import { Counter, FieldError, Section } from "./section";
import { useActionToast } from "./use-action-toast";

type Props = { siteId: string; bot: SiteSettings["chatBot"] };

export const BusinessForm = ({ siteId, bot }: Props) => {
  const notify = useActionToast();
  const form = useForm<z.input<typeof BusinessInfoSchema>, unknown, z.output<typeof BusinessInfoSchema>>({
    resolver: zodResolver(BusinessInfoSchema),
    defaultValues: {
      description: bot?.description ?? "",
      addressing: bot?.addressing === "usted" ? "usted" : "vos",
      contact: bot?.contact ?? "",
    },
  });
  const { errors, isSubmitting } = form.formState;
  const [description, contact] = useWatch({ control: form.control, name: ["description", "contact"] });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await onUpdateBusinessInfo(siteId, values);
    notify(result);
  });

  return (
    <Section id="negocio" title="Negocio" description="Lo que el bot sabe de tu negocio y cómo habla con tus clientes.">
      {(!description.trim() || !contact.trim()) && (
        <Alert data-testid="business-hint">
          <AlertDescription>
            Completá la descripción y el contacto: el bot responde mejor y deriva a tus clientes al canal correcto.
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <Label htmlFor="description">A qué se dedica tu negocio</Label>
            <Counter value={description} max={LIMITS.description} />
          </div>
          <Textarea
            id="description"
            rows={4}
            placeholder="Ej.: Panadería artesanal en Rosario. Hacemos pan de masa madre, facturas y tortas por encargo."
            {...form.register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium mb-2">Cómo trata el bot a tus clientes</legend>
          <Controller
            control={form.control}
            name="addressing"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="vos" id="addressing-vos" />
                  <Label htmlFor="addressing-vos" className="font-normal">
                    De vos (“¿Qué necesitás?”)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="usted" id="addressing-usted" />
                  <Label htmlFor="addressing-usted" className="font-normal">
                    De usted (“¿Qué necesita?”)
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
          <FieldError message={errors.addressing?.message} />
        </fieldset>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <Label htmlFor="contact">A dónde deriva cuando no sabe algo</Label>
            <Counter value={contact} max={LIMITS.contact} />
          </div>
          <Input id="contact" placeholder="Ej.: WhatsApp +54 9 341 555-0101, de lunes a viernes de 9 a 18" {...form.register("contact")} />
          <FieldError message={errors.contact?.message} />
        </div>

        <Button type="submit" disabled={isSubmitting} className="self-end" data-testid="save-business">
          {isSubmitting ? "Guardando…" : "Guardar"}
        </Button>
      </form>
    </Section>
  );
};
