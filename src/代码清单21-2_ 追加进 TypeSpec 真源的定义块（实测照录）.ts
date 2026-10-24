// M00.F02.I07 accept an invitation by token; expired token returns 410
@route("/invitations")
@tag("tenant-members")
namespace Saas.Identity.Shared.Invitations {
  @post
  @route("/{token}/accept")
  op acceptInvitation(@path token: string): TenantMemberView | ErrorResponse;
}