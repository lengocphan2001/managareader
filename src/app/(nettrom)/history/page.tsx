import { Metadata } from "next";
import HistoryList from "@/components/nettrom/lich-su/history-list";
import TopTitles from "@/components/nettrom/common/top-titles-table";
import { Constants } from "@/constants";

export const metadata: Metadata = {
  title: `Reading History at ${Constants.APP_NAME}`,
};

export default function History() {
  return (
    <>
      <div id="ctl00_Breadcrumbs_pnlWrapper">
        <ul className="breadcrumb" itemType="http://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemType="http://schema.org/ListItem">
            <a
              href="https://www.nettruyenmax.com"
              className="itemcrumb"
              itemProp="item"
              itemType="http://schema.org/Thing"
            >
              <span itemProp="name">Home</span>
            </a>
            <meta itemProp="position" content={"1"} />
          </li>
          <li itemProp="itemListElement" itemType="http://schema.org/ListItem">
            <a
              href="https://www.nettruyenmax.com/history"
              className="itemcrumb active"
              itemProp="item"
              itemType="http://schema.org/Thing"
            >
              <span itemProp="name">History</span>
            </a>
            <meta itemProp="position" content={"2"} />
          </li>
        </ul>
      </div>
      <div className="row">
        <div id="ctl00_divCenter" className="center-side col-md-8">
          <div className="mrb10 Module Module-233">
            <div className="ModuleContent">
              <h1 className="page-title">
                Reading History <em className="fa fa-angle-right" />
              </h1>
              <div className="mrt15 visited-tab">
                <ul
                  className="comment-nav text-center"
                  style={{ fontSize: 16, marginBottom: 15 }}
                >
                  <li className="active">
                    <a>From Device</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <HistoryList />
        </div>
        <div id="ctl00_divRight" className="right-side col-md-4 cmszone">
          <TopTitles />
        </div>
      </div>
    </>
  );
}
