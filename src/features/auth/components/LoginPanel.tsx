import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Button, Tag } from '../../../shared/ui'
import { safeNext, signInWithGithub, signOut, useSession } from '../session.ts'

const CAN_DO = ['이번 주 참가', '결과물 제출', '투표', '피드백']

/** GitHub 로그인. ?next=/submit 이면 로그인 뒤 그곳으로 돌아가요. */
function LoginPanel() {
  const session = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login() {
    setPending(true)
    setError(null)
    try {
      await signInWithGithub()
      navigate(next, { replace: true })
    } catch {
      setError('GitHub로 연결하지 못했어요. 잠시 뒤 다시 눌러 주세요.')
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-160">
      <span className="mono text-[13px] text-(--tt-muted)">로그인</span>

      {session ? (
        <>
          <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">
            {session.handle}로
            <br />
            로그인돼 있어요.
          </h1>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" href={next} label="계속하기" hasArrow />
            <Button variant="primary" label="로그아웃하기" onClick={signOut} />
          </div>
        </>
      ) : (
        <>
          <h1 className="m-0 overflow-hidden text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">
            GitHub 계정으로
            <br />
            바로 참가해요.
          </h1>
          <p className="m-0 text-lg leading-[1.7] text-(--tt-ink-soft)">
            제출작의 레포 링크와 프로필이 GitHub 계정으로 이어져요. 비밀번호는 따로 만들지 않아요.
          </p>
          <ul aria-label="로그인하면 할 수 있는 것" className="m-0 p-0 list-none flex flex-wrap gap-2">
            {CAN_DO.map((item) => (
              <li key={item}>
                <Tag>{item}</Tag>
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-start gap-3">
            <Button
              variant={pending ? 'disabled' : 'secondary'}
              label={pending ? 'GitHub로 이동하는 중' : 'GitHub로 계속하기'}
              hasArrow={!pending}
              onClick={login}
            />
            {error && (
              <p role="alert" className="m-0 text-sm text-(--tt-ink)">
                {error}
              </p>
            )}
          </div>
          <p className="m-0 text-sm text-(--tt-muted)">
            로그인하면 <a href="#">운영 원칙</a>에 동의한 것으로 봐요.
          </p>
        </>
      )}
    </div>
  )
}

export default LoginPanel
