"use client";
import { useDomain } from "@/hooks/sidebar/use-domain";
import FormGenerator from "../forms/form-generator";
import { Loader } from "../loader";
import { Button } from "../ui/button";
import UploadButton from "../upload-button";

type Props = { className?: string };

export const AddDomainForm = ({ className = "mt-3 w-6/12 flex flex-col gap-3" }: Props) => {
  const { register, onAddDomain, loading, errors } = useDomain();

  return (
    <Loader loading={loading}>
      <form className={className} onSubmit={onAddDomain}>
        <FormGenerator
          inputType="input"
          register={register}
          label="Dominio"
          name="domain"
          errors={errors}
          placeholder="minegocio.com.ar"
          type="text"
        />
        <UploadButton register={register} label="Ícono (opcional)" errors={errors} />
        <Button type="submit" className="w-full">
          Agregar sitio
        </Button>
      </form>
    </Loader>
  );
};
