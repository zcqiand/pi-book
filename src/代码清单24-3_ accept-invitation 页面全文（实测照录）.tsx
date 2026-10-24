"use client";

// /accept-invitation — M00.F02.I07 接受邀请（前端消费层，六层切片第四层）
//
// 数据面零手写请求：全部走 orval 生成客户端的 react-query mutation hook
// useInvitationsAcceptInvitation（src/api/endpoints/tenant-members/tenant-members.ts，
// orval 产物零手改）。token 从 URL ?token= 读（邀请链接形态），
// 沿 login 页先例用 window.location.search 直读，不依赖 useSearchParams 的
// Suspense 时序。
// 展示四态：缺 token / 待接受（含接受中）/ 成功（TenantMemberView）/
// 错误（ErrorResponse {code,message} 经 toApiError 透传）。

import { useEffect, useState } from "react";
import Link from "next/link";
import { useInvitationsAcceptInvitation } from "@/api/endpoints/tenant-members/tenant-members";
import { toApiError } from "@/api/http-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcceptInvitationPage() {
  const [token, setToken] = useState("");
  const acceptMut = useInvitationsAcceptInvitation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  const result = acceptMut.data?.data;
  const apiErr = acceptMut.isError ? toApiError(acceptMut.error) : null;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>接受邀请</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token && (
            <p className="text-sm text-slate-500">
              链接缺少 token 参数，请使用邀请邮件里的完整链接。
            </p>
          )}

          {token && !acceptMut.isSuccess && (
            <>
              <p className="text-sm text-slate-600">
                你收到了加入租户的邀请。点击下方按钮确认接受。
              </p>
              <Button onClick={() => acceptMut.mutate({ token })} disabled={acceptMut.isPending}>
                {acceptMut.isPending ? "接受中…" : "接受邀请"}
              </Button>
            </>
          )}

          {acceptMut.isSuccess && result && (
            <div className="space-y-2">
              <p className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                接受成功，你已加入租户。
              </p>
              <dl className="text-sm space-y-1">
                <div className="flex gap-2">
                  <dt className="text-slate-500">租户</dt>
                  <dd className="font-mono">{result.member.tenantId}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-slate-500">成员名</dt>
                  <dd>{result.member.memberName}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-slate-500">账号</dt>
                  <dd>
                    {result.user.username}（{result.user.email ?? "-"}）
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-slate-500">状态</dt>
                  <dd>{result.user.status}</dd>
                </div>
              </dl>
              <Link href="/tenants" className="text-sm text-blue-600 underline">
                前往工作台
              </Link>
            </div>
          )}

          {apiErr && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800 space-y-1">
              <p className="font-medium">接受失败（HTTP {apiErr.status}）</p>
              <p>错误码：{apiErr.body?.code ?? "unknown"}</p>
              <p>{apiErr.body?.message ?? apiErr.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}