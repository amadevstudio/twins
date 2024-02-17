import { searchUserPageSize } from "@/server/api/types/user";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";
import { pageParamName } from "@/pages/search/helper";

export default function PaginationConstructor({
  total,
  currentPage,
  perPage,

  baseUrl,
  pageParamName,
}: {
  total?: number;
  currentPage: number;
  perPage: number;

  baseUrl: string;
  pageParamName: string;
}) {
  const pagesCount = !!total ? Math.ceil(total / perPage) : undefined;

  if (pagesCount && pagesCount < 2) {
    return null;
  }

  const buttons: number[] = [];
  const maxAdditionalButtons = 4;

  const toMax = pagesCount ? pagesCount - currentPage : undefined;
  const fromIterationRaw = toMax
    ? currentPage -
      maxAdditionalButtons +
      (toMax > maxAdditionalButtons / 2 ? maxAdditionalButtons / 2 : toMax)
    : currentPage - maxAdditionalButtons;
  const fromIteration = fromIterationRaw > 1 ? fromIterationRaw : 1;
  const toIterationRaw = toMax
    ? fromIteration + maxAdditionalButtons
    : currentPage;
  const toIteration = pagesCount
    ? toIterationRaw < pagesCount
      ? toIterationRaw
      : pagesCount
    : currentPage;

  for (let i = fromIteration; i <= toIteration; i++) {
    buttons.push(i);
  }

  return (
    <>
      <Pagination>
        <PaginationContent>
          {buttons.length > 0 && buttons[0] !== undefined && buttons[0] > 1 && (
            <PaginationItem>
              <PaginationPrevious
                ariaLabel="Вернуться к первой странице"
                text="В начало"
                href={`${baseUrl}`}
              />
            </PaginationItem>
          )}

          {buttons.map((b) => (
            <PaginationItem key={b}>
              <PaginationLink
                isActive={currentPage === b}
                href={`${baseUrl}&${pageParamName}=${b}`}
              >
                {b}
              </PaginationLink>
            </PaginationItem>
          ))}

          {((!!pagesCount && currentPage != pagesCount) || !pagesCount) && (
            <PaginationItem>
              <PaginationNext
                ariaLabel="Перейти к следующей странице"
                text="Дальше"
                href={`${baseUrl}&${pageParamName}=${currentPage + 1}`}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </>
  );
}
