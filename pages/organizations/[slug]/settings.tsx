import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import { Input, Button, Typography } from "@supabase/ui";
import React from "react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";

import { Card } from "@components/ui";
import { inferSSRProps } from "@lib/inferSSRProps";
import tenants from "models/tenants";
import { put } from "@lib/fetch";

const Settings: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ organization }) => {
  const formik = useFormik({
    initialValues: {
      name: organization.name,
      slug: organization.slug,
      domain: organization.domain,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required("Name is required"),
      slug: Yup.string().required("Slug is required"),
      domain: Yup.string().nullable(),
    }),
    onSubmit: async (values) => {
      const { name, slug, domain } = values;

      const { data, error } = await put(
        `/api/organizations/${organization.slug}`,
        {
          name,
          slug,
          domain,
        }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data) {
        toast.success("Successfully updated");
      }
    },
  });

  return (
    <>
      <Typography.Title level={4}>{organization.name}</Typography.Title>
      <form onSubmit={formik.handleSubmit}>
        <Card heading="General">
          <Card.Body className="px-3 py-3">
            <div className="flex flex-col space-y-6">
              <Input
                name="name"
                label="Display name"
                descriptionText="A human-friendly name for the organization"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.errors.name}
              />
              <Input
                name="slug"
                label="Organization slug"
                descriptionText="A unique ID used to identify this organization"
                value={formik.values.slug}
                onChange={formik.handleChange}
                error={formik.errors.slug}
              />
              <Input
                name="domain"
                label="Domain"
                descriptionText="Domain name for the organization"
                value={formik.values.domain ? formik.values.domain : ""}
                onChange={formik.handleChange}
                error={formik.errors.domain}
              />
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-end">
              <Button htmlType="submit" loading={formik.isSubmitting}>
                Save Changes
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { slug } = context.query;

  const organization = await tenants.getTenant({ slug: slug as string });

  if (!organization) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      organization,
    },
  };
};

export default Settings;
