import * as http from './http'
import {IBaseAttIDDocData} from '@bloomprotocol/attestations-lib/dist/AttestationData'

type BaseResponse = {
  success: boolean
  message: string
}

export const session = (): Promise<BaseResponse & {token: string}> =>
  http.post(`/session`)

export const getReceivedData = (
  token: string
): Promise<
  BaseResponse & {receivedData: {email: string; idDoc: IBaseAttIDDocData}}
> => http.get(`/received-data?token=${encodeURIComponent(token)}`)
