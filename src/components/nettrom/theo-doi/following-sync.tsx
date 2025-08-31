import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

import Iconify from "@/components/iconify";
import useHostname from "@/hooks/useHostname";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Constants } from "@/constants";

import OpenDevToolsImage from "@/assets/sync-guide/open-dev-tools.jpg";
import OpenConsoleImage from "@/assets/sync-guide/open-console.jpg";
import CMangaSyncImage from "@/assets/sync-guide/cmanga-sync.png";

import { Button } from "../Button";

const headingClassName = "text-3xl text-orange-500 mt-3";

export default function FollowingSync() {
  const [source, setSource] = useState<string>("");
  return (
    <div>
      <div>
        Guide to sync followed manga list from CManga, MangaDex, CuuTruyen to
        TruyenDex
      </div>
      <div className="text-base text-gray-300">
        <b>Note:</b> The operations below can only be performed on
        desktop/laptop devices.
      </div>
      <div className={headingClassName}>Step 1:</div>

      <div className="flex items-center gap-2">
        <div>Select source to sync:</div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="form-select text-black"
        >
          <option value="">Chọn nguồn</option>
          <option value="cmanga">CManga</option>
          <option value="mangadex">MangaDex</option>
          <option value="cuutruyen">CuuTruyen</option>
        </select>
      </div>

      <div className="text-base text-gray-300">
        <b>Note:</b> You can sync NetTruyen, TruyenQQ to CManga, then sync
        CManga to TruyenDex.
      </div>

      <div className={headingClassName}>Step 2:</div>
      {source ? (
        <Step2 source={source} />
      ) : (
        <div>Please select a sync source</div>
      )}

      <div className={headingClassName}>Bước 3:</div>
      {source ? (
        <Step3 source={source} />
      ) : (
        <div>Please select a sync source</div>
      )}

      <div className={headingClassName}>Bước 4:</div>
      {source ? (
        <Step4 source={source} />
      ) : (
        <div>Please select a sync source</div>
      )}

      <div className={headingClassName}>Bước 5:</div>
      {source ? (
        <Step5 source={source} />
      ) : (
        <div>Please select a sync source</div>
      )}
    </div>
  );
}

function Step2({ source }: { source: string }) {
  return (
    <div>
      Visit {source} and <b>log in</b>.
      {source === "cmanga" && (
        <>
          <div>
            After logging into CManga, you can sync manga from NetTruyen and
            TruyenQQ to CManga first.
          </div>
          <Image className="mt-1" src={CMangaSyncImage} alt="CManga" />
        </>
      )}
    </div>
  );
}

function Step3({ source }: { source: string }) {
  return (
    <div>
      <div>Tại website của {source}, mở tab Console của Developer Tools:</div>
      <ul>
        <li>Windows: Ctrl + Shift + J</li>
        <li>Mac: Command (⌘) + Option (⌥) + J</li>
        <li>Hoặc làm thủ công theo bước dưới để mở Developer Tools:</li>
      </ul>
      <Image
        className="mt-1"
        src={OpenDevToolsImage}
        alt="Open Developer Tools"
      />
    </div>
  );
}

function Step4({ source }: { source: string }) {
  const hostname = useHostname();
  const script = `fetch("https://${hostname}/api/sync-script").then((r)=>r.text()).then((c)=>{eval(c)})`;
  const [_, copy] = useCopyToClipboard();

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        toast.success("Script copied!");
      })
      .catch((error) => {
        console.error("Failed to copy!", error);
      });
  };

  return (
    <div>
      <div>
        Open the Console tab, copy the script below, paste it into Console and
        press Enter.
      </div>
      <pre className="whitespace-pre-wrap break-words rounded bg-gray-800 p-4 text-white">
        <code className="whitespace-pre-wrap break-words">{script}</code>
      </pre>
      <Button
        className=""
        icon={<Iconify icon="fa:copy" />}
        onClick={handleCopy(script)}
      >
        Copy
      </Button>
      <Image className="mt-1" src={OpenConsoleImage} alt="Open Console" />
    </div>
  );
}

function Step5({ source }: { source: string }) {
  return (
    <div>
      <div>
        Làm theo các hướng dẫn còn lại. Nếu gặp bất cứ vấn đề nào, hãy nhắn tin
        để mình có thể hỗ trợ.
      </div>
      <Link href={Constants.Routes.report} target="_blank">
        <Button icon={<Iconify icon="fa:comment" />}>Hỗ trợ</Button>
      </Link>
    </div>
  );
}
