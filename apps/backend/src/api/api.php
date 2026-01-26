<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AsyncTask;
use Exception;
use Illuminate\Database\Eloquent\Casts\Json;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ApiController extends Controller
{
    const devuid = "0";

    const PCUa = "netdisk;4.37.5;PC;PC-Windows;10.0.26100;UniBaiduYunGuanJia";
    const PCChannel = "Windows_10.0.26100_Uniyunguanjia_netdisk_00000000000000000000000040000001";
    const PCVersion = "4.37.5";

    const UnionVersion = "7.51.0.133";
    const DownloadEngineVersion = "3.0.20.88";

    const AndroidUa = "netdisk;12.16.54;23049RAD8C;android-android;13;JSbridge4.4.0;jointBridge;1.1.0;";
    const AndroidChannel = "android_13_23049RAD8C_bd-netdisk_1027840c";
    const AndroidVersion = "12.16.54";

    const NormalAppId = "250528";
    const EnterpriseAppId = "24029990";

    public static function getList($cookie, $path)
    {
        $option = [
            "headers" => [
                "User-Agent" => self::PCUa,
                "Cookie" => $cookie
            ],
            "query" => [
                "clienttype" => "0",
                "app_id" => "250528",
                "web" => "1",
                "order" => "time",
                "desc" => "1",
                "dir" => $path,
                "num" => "100",
                "page" => "1"
            ],
        ];

        $response = UtilsController::sendRequest(
            "ApiController::getList",
            "get",
            "https://pan.baidu.com/api/list",
            $option
        );

        $responseData = $response->getData(true);
        if ($responseData["code"] !== 200) return $response;

        $responseData = $responseData["data"];
        if (
            !isset($responseData["errno"]) ||
            $responseData["errno"] !== 0
        ) {
            Log::error("getList error", [$option, $responseData]);
            return ResponseController::getListFailed($responseData["errno"] ?? "未知", $responseData["show_msg"] ?? "未知", false);
        }

        return ResponseController::success($responseData["list"]);
    }

    public static function getQuota($cookie)
    {
        $option = [
            "headers" => [
                "User-Agent" => self::PCUa,
                "Cookie" => $cookie
            ],
            "query" => []
        ];

        $response = UtilsController::sendRequest(
            "ApiController::getQuota",
            "post",
            "https://pan.baidu.com/api/quota",
            $option
        );

        $responseData = $response->getData(true);
        if ($responseData["code"] !== 200) return $response;

        $responseData = $responseData["data"];
        if (
            !isset($responseData["errno"]) ||
            $responseData["errno"] !== 0
        ) {
            Log::error("getQuota error", [$option, $responseData]);
            return ResponseController::getQuotaFailed($responseData["errno"] ?? "未知", $responseData["show_msg"] ?? "未知", false);
        }

        return ResponseController::success([
            "used" => $responseData["used"],
            "total" => $responseData["total"],
        ]);
    }

    public static function getEnterpriseList($cookie, $cid, $path, $all = false)
    {
        $list = [];
        $page = 1;

        while (true) {
            $option = [
                "headers" => [
                    "User-Agent" => self::PCUa,
                    "Cookie" => $cookie
                ],
                "query" => [
                    "clienttype" => "0",
                    "app_id" => "24029990",
                    "web" => "1",
                    "order" => "time",
                    "desc" => "1",
                    "dir" => $path,
                    "num" => "100",
                    "page" => $page,
                    "cid" => $cid
                ],
            ];

            $response = UtilsController::sendRequest(
                "ApiController::getEnterpriseList",
                "get",
                "https://pan.baidu.com/mid_enterprise_v2/api/list",
                $option
            );

            $responseData = $response->getData(true);
            if ($responseData["code"] !== 200) return $response;

            $responseData = $responseData["data"];
            if (
                !isset($responseData["errno"]) ||
                $responseData["errno"] !== 0
            ) {
                Log::error("getEnterpriseList error", [$option, $responseData]);
                return ResponseController::getListFailed($responseData["errno"] ?? "未知", $responseData["show_msg"] ?? "未知");
            }

            $list = array_merge($list, $responseData["list"]);
            if (!$all) break;

            if (!$responseData["has_more"]) break;
            $page++;
        }

        return ResponseController::success($list);
    }

    public static function getQrLoginToken($cookie, $sign)
    {
        $option = [
            "headers" => [
                "User-Agent" => "Mozilla/5.0 (Linux; Android 12; 2410CRP4CC Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 Mobile Safari/537.36 Sapi_9.10.4_Android_%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%98_12.11.9_2410CRP4CC_12_Sapi",
                "Cookie" => $cookie
            ]
        ];

        $requestUrl = "https://wappass.baidu.com/wp/?qrlogin&error=0&cmd=login&lp=pc&tpl=netdisk&adapter=3&clientfrom=native&qrloginfrom=native&extrajson=&credentialKey=1&deliverParams=1&liveAbility=1&support_photo=1&suppcheck=1&supFaceLogin=1&scanface=1&sign={$sign}";

        $response = UtilsController::sendRequest(
            "ApiController::getQrLoginToken",
            "get",
            $requestUrl,
            $option
        );

        $responseData = $response->getData(true);
        if ($responseData["code"] !== 200) return $response;

        $responseData = $responseData["data"];

        $key = "token";
        $tokenValue = null;

        // 1. 优先尝试从 tplVars 中获取
        if (preg_match('/tplVars\s*=\s*"([^"]+)"/', $responseData, $matches)) {
            try {
                $tplVarsStr = str_replace('\x22', '"', $matches[1]);
                $tplVarsData = json_decode($tplVarsStr, true);
                if ($tplVarsData && isset($tplVarsData[$key])) $tokenValue = $tplVarsData[$key];
            } catch (Exception $e) {
            }
        }

        // 2. 如果tplVars中没有找到，尝试正则匹配其他格式
        $patterns = [
            "/{$key}\s*[:=]\s*['\"]([^'\"]+)['\"]/",  // token:'xxx' 或 token="xxx"
            "/{$key}\s*=\s*['\"]([^'\"]+)['\"]/",     // token='xxx'
            "/['\"]?{$key}['\"]?\s*:\s*['\"]([^'\"]+)['\"]/",  // "token":"xxx"
            "/data-{$key}\s*=\s*['\"]([^'\"]+)['\"]/",  // data-token="xxx"
            "/{$key}\s*=\s*([^,\s]+)/"  // token=xxx
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $responseData, $matches)) {
                $tokenValue = $matches[1];
                break;
            }
        }

        if (!$tokenValue) {
            Log::error("getQrLoginToken error", [$option, $requestUrl, $responseData]);
            return ResponseController::getQrLoginTokenFailed();
        }

        return ResponseController::success([
            "token" => $tokenValue
        ]);
    }

    public static function doQrLogin($cookie, $sign, $token)
    {
        $option = [
            "headers" => [
                "User-Agent" => "Mozilla/5.0 (Linux; Android 12; 2410CRP4CC Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 Mobile Safari/537.36 Sapi_9.10.4_Android_%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%98_12.11.9_2410CRP4CC_12_Sapi",
                "Cookie" => $cookie,
                "Origin" => "https://wappass.baidu.com",
                "Referer" => "https://wappass.baidu.com/wp/?qrlogin&sign={$sign}&v=" . time() . "0000"
            ],
            "form_params" => [
                "tpl" => "netdisk",
                "lp" => "pc",
                "token" => $token,
                "sign" => $sign,
            ]
        ];

        $requestUrl = "https://wappass.baidu.com/wp/?qrlogin";
        $requestUrl .= "&v=" . time() . "0000";

        $response = UtilsController::sendRequest(
            "ApiController::doQrLogin",
            "post",
            $requestUrl,
            $option
        );

        $responseData = $response->getData(true);
        if ($responseData["code"] !== 200) return $response;

        $responseData = $responseData["data"];
        if (
            !isset($responseData['errInfo']['no']) ||
            $responseData['errInfo']['no'] !== "0"
        ) {
            Log::error("doQrLogin error", [$option, $requestUrl, $responseData]);
            return ResponseController::doQrLoginFailed($responseData['errInfo']['no'] ?? "未知", $responseData['errInfo']['msg'] ?? "未知");
        }

        return ResponseController::success();
    }

    public static function enterpriseGetDirSize($cookie, $cid, $list)
    {
        $option = [
            "headers" => [
                "User-Agent" => self::PCUa,
                "Cookie" => $cookie
            ],
            "query" => [
                "clienttype" => "0",
                "app_id" => self::EnterpriseAppId,
                "web" => "1",
                "async" => "2",
                "list" => JSON::encode($list),
                "cid" => $cid
            ]
        ];

        $response = UtilsController::sendRequest(
            "ApiController::enterpriseGetDirSize",
            "get",
            "https://pan.baidu.com/mid_enterprise_v2/api/dirsize",
            $option
        );

        $responseData = $response->getData(true);
        if ($responseData["code"] !== 200) return $response;

        $responseData = $responseData["data"];
        if (
            !isset($responseData["errno"]) ||
            $responseData["errno"] !== 0
        ) {
            Log::error("enterpriseGetDirSize error", [$option, $responseData]);
            return ResponseController::enterpriseGetDirSizeFailed($responseData["errno"] ?? "未知", $responseData["show_msg"] ?? "未知");
        }

        while (true) {
            $taskQuery = self::enterpriseTaskQuery($cookie, $cid, $responseData["taskid"]);
            $taskQueryData = $taskQuery->getData(true);
            if ($taskQueryData["code"] !== 200) {
                if (str_contains($taskQueryData["message"], "任务进行中")) {
                    sleep(3);
                    continue;
                }

                return $taskQuery;
            }

            return ResponseController::success($taskQueryData["data"]);
        }
    }

    public static function testProxy()
    {
        return UtilsController::sendRequest(
            "ApiController::testProxy",
            "get",
            "https://www.cz88.net/api/cz88/ip/base?ip="
        );
    }
}
