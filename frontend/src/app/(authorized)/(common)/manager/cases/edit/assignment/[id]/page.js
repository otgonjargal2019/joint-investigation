"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

import Button from "@/shared/components/button";
import Label from "@/shared/components/form/label";
import { useCreateCase } from "@/entities/case";
import { useCountries } from "@/entities/organizationalData";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Textarea from "@/shared/components/form/textarea";
import ChevronTabs from "@/shared/components/chevronTab";
import DatePickerInput from "@/shared/components/form/datepicker";
import InvestigatorAssign from "@/shared/widgets/manager/investigatorAssign";
import PageTitle from "@/shared/components/pageTitle/page";

function CreateNewCase() {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const t = useTranslations();

    const params = useParams();
    const caseId = params.id;

    const [createdCaseId, setCreatedCaseId] = useState(null);

    const router = useRouter();
    const createCase = useCreateCase();

    const onSubmit = async (data) => {
        try {
            const response = await createCase.mutateAsync({
                caseName: data.caseName,
                caseOutline: data.caseOutline,
                contentType: data.contentType,
                infringementType: data.infringementType,
                relatedCountries: data.relatedCountries,
                priority: Number(data.priority),
                investigationDate: data.investigationDate,
                etc: data.etc,
                ...(createdCaseId !== null ? { caseId: createdCaseId } : {}),
            });

            setCreatedCaseId(response.caseId);

            toast.success(t('case-detail.create-success'), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            setActiveTab(1);
        } catch (error) {
            toast.error(t('case-detail.create-error'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            console.error('Failed to create case:', error);
        }
    };

    const onGoBack = () => {
        router.push(`/manager/cases/${caseId}`);
    };

    return (
        <div>
            <PageTitle title={t("assign-investigator")} />
            <div className="flex flex-col items-center">
                <div className="flex justify-center">
                    <InvestigatorAssign />
                </div>
            </div>
        </div>
    );
}

export default CreateNewCase;
