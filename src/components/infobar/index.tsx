import BreadCrumb from "./bread-crumb";

/** Page title and description, from the current route. */
const InfoBar = () => (
  <div className="flex w-full justify-between items-center py-1 mb-8">
    <BreadCrumb />
  </div>
);

export default InfoBar;
