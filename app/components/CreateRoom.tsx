"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChatServices } from "@/hooks/useChatServices";
import { useEthereum } from "@/store/ethereum";
import clsx from "clsx";
import { isAddress } from "ethers";
import { Trash } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const CreateRoom = ({ toggleOpenDialog }: { toggleOpenDialog: Dispatch<SetStateAction<boolean>> }) => {
  const { signer } = useEthereum();
  const { createRoom } = useChatServices();

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Room name must at least 2 characters",
    }),
    participants: z
      .array(
        z.object({
          value: z.string(),
        }),
      )
      .min(1, {
        message: "At least 1 participants",
      })
      .max(4, {
        message: "Maximum 4 participants",
      })
      .refine(
        (values) => {
          return !values.some((val) => !val.value || !isAddress(val.value) || val.value === signer?.address);
        },
        {
          message: "Address is not valid",
        },
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      participants: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = {
        _roomName: values.name,
        _participants: values.participants.map((part) => part.value),
      };
      await createRoom?.(data._roomName, data._participants);
      form.reset();
      toggleOpenDialog(false);
    } catch (error) {}
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Room name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="participants"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-4">
              <FormLabel className="flex items-center justify-between">
                <span>Participants</span>
                <span
                  onClick={() =>
                    append({
                      value: "",
                    })
                  }
                  className={clsx("text-blue-500 cursor-pointer", {
                    "pointer-events-none text-slate-400":
                      form.getValues("participants").some((item) => !item.value) ||
                      form.getValues("participants").length >= 4,
                  })}
                >
                  New
                </span>
              </FormLabel>
              {fields.map((field, index) => (
                <FormControl key={field.id}>
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Participant address"
                      key={field.id}
                      {...form.register(`participants.${index}.value`)}
                    />
                    <Button onClick={() => remove(index)} variant="secondary" size="icon">
                      <Trash size={12} />
                    </Button>
                  </div>
                </FormControl>
              ))}
              {fieldState?.error?.root?.message && (
                <p className="text-destructive !text-[13px] !mt-2">{fieldState.error.root.message}</p>
              )}
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
};

export default CreateRoom;
