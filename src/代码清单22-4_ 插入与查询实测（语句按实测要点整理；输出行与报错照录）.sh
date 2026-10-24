-- 第一插：漏了 tenant_key 列
insert into tenant (name, status) values ('ch22-evidence-demo', 1);
# PostgresError: null value in column "tenant_key" of relation "tenant"
#   violates not-null constraint（SQLSTATE 23502）

-- 补列重插：父行落座
insert into tenant (tenant_key, name, status) values ('ch22-demo-key', 'ch22-evidence-demo', 1)
  returning id;
# 6984ce97-dc19-4ce3-962d-8e9d80718223

-- 子行：邀请令牌，有效期为插入时刻加 7 天
insert into invitation_token (tenant_id, email, token, expires_at)
  values ('6984ce97-dc19-4ce3-962d-8e9d80718223', 'alice@example.com',
          'ch22-evd-eeba60f9', /* 插入时刻 + 7 天 */)
  returning id, token, accepted_at;
# 9d0511e0-413f-4615-ac20-cceeffda5804 | ch22-evd-eeba60f9 | (null)

-- 按 token 联查
select t.name as tenant_name, i.email, i.token, i.expires_at, i.accepted_at
  from invitation_token i join tenant t on t.id = i.tenant_id
  where i.token = 'ch22-evd-eeba60f9';
# {"tenant_name":"ch22-evidence-demo","email":"alice@example.com",
#  "token":"ch22-evd-eeba60f9","expires_at":"2026-10-16T19:17:22.419Z",
#  "accepted_at":null}