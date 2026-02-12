"use client";

import React, { useEffect } from "react";
import {
    BookText,
    CircleUser,
    CircleUserRound,
    Library,
    SquareUser,
} from "lucide-react";


export default function DashboardIndexPage(): React.ReactElement {


    return (
        <div className="col-span-12 mt-24">
            <div className="intro-y flex items-center h-10">
                <h2 className="text-lg font-medium truncate mr-5">
                    Content Planner
                </h2>
            </div>

            <div className="grid grid-cols-12 gap-6 mt-5">
                <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                    <div className="report-box zoom-in">
                        <div className="box p-5">
                            <div className="flex">
                                <Library className="report-box__icon text-primary" />
                            </div>

                            <div className="text-3xl font-medium leading-8 mt-6">
                                10
                            </div>

                            <div className="text-base text-slate-500 mt-1">
                                Intervention
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
