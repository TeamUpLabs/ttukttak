import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../shared/ui'
import { adminApi } from '../../../api/admin.ts'
import { INPUT, messageOf } from '../admin.ts'

/** weeks.json을 붙여 넣거나 파일로 골라 한 번에 가져와요. id가 같으면 덮어써요. */
function ImportWeeks() {
  const [text, setText] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: adminApi.importWeeks,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weeks'] }),
  })

  function submit() {
    setParseError(null)
    try {
      const json = JSON.parse(text)
      // weeks.json 전체든, 주차 배열만이든 받아요.
      save.mutate(Array.isArray(json) ? { weeks: json } : json)
    } catch {
      setParseError('JSON 형식이 아니에요.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-bold">weeks.json 파일</span>
        <input
          type="file"
          accept="application/json,.json"
          onChange={async (e) => setText((await e.target.files?.[0]?.text()) ?? '')}
          className="text-[15px]"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-bold">또는 붙여 넣기</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='{ "weeks": [ … ] }'
          className={`${INPUT} mono min-h-40 py-3 text-[13px] resize-y`}
        />
      </label>
      {(parseError || save.error) && <p role="alert" className="m-0 text-[15px]">{parseError ?? messageOf(save.error)}</p>}
      {save.isSuccess && <p role="status" className="m-0 text-[15px] text-(--tt-ink-soft)">가져왔어요.</p>}
      <div>
        <Button variant={text.trim() && !save.isPending ? 'secondary' : 'disabled'} label={save.isPending ? '가져오는 중' : '가져오기'} onClick={submit} />
      </div>
    </div>
  )
}

export default ImportWeeks
