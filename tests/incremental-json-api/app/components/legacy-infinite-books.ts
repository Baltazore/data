import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import type Store from '@ember-data/store';
import type { Collection } from '@ember-data/store/-private/record-arrays/identifier-array';

import type Book from '../models/book';

export interface InfiniteBookSignature {
  Element: HTMLUListElement;
  Args: {
    allBooks: Collection<Book>;
  };
}

class Pages<T> {
  @tracked pages: Collection<T>[] = [];
  @tracked data: T[] = [];

  constructor(page: Collection<T>) {
    this.pages = [page];
    this.data = page.slice();
  }

  addPage(page: Collection<T>) {
    this.pages.push(page);
    this.data = this.data.concat(page);
  }
}

export default class InfiniteBookComponent extends Component<InfiniteBookSignature> {
  @service declare store: Store;
  pageCollection = new Pages(this.args.allBooks);

  get books(): Book[] {
    return this.pageCollection.data;
  }

  next = async () => {
    const meta = this.pageCollection.pages.at(-1)?.query as { page: number; pageSize: number };
    if (!meta) {
      return;
    }
    const result = await this.store.query<Book>('book', { page: meta.page + 1, pageSize: meta.pageSize });
    this.pageCollection.addPage(result);
  };
}
